import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { VaultEntry, VaultEntryDocument } from './schemas/vault-entry.schema';
import { CreateVaultEntryDto } from './dto/create-vault-entry.dto';
import { UpdateVaultEntryDto } from './dto/update-vault-entry.dto';

const MASK = '••••••••';
const ALGORITHM = 'aes-256-gcm';

@Injectable()
export class VaultService {
  private readonly logger = new Logger(VaultService.name);
  private readonly encryptionKey: Buffer | null;

  constructor(
    @InjectModel(VaultEntry.name)
    private readonly vaultModel: Model<VaultEntryDocument>,
  ) {
    const keyHex = process.env.VAULT_ENCRYPTION_KEY ?? '';
    if (keyHex.length === 64) {
      this.encryptionKey = Buffer.from(keyHex, 'hex');
    } else {
      this.encryptionKey = null;
      if (keyHex.length > 0) {
        this.logger.warn('VAULT_ENCRYPTION_KEY must be exactly 64 hex chars. Sensitive values will not be encrypted.');
      } else {
        this.logger.warn('VAULT_ENCRYPTION_KEY is not set. Sensitive values will not be encrypted.');
      }
    }
  }

  // ── Crypto helpers ────────────────────────────────────────────────────────

  private encrypt(plaintext: string): string {
    if (!this.encryptionKey) return plaintext;
    const iv = randomBytes(12);
    const cipher = createCipheriv(ALGORITHM, this.encryptionKey, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
  }

  private decrypt(stored: string): string {
    if (!this.encryptionKey) return stored;
    // If the value doesn't look like an encrypted blob, return as-is
    const parts = stored.split(':');
    if (parts.length !== 3) return stored;
    const [ivHex, authTagHex, ciphertextHex] = parts;
    try {
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const ciphertext = Buffer.from(ciphertextHex, 'hex');
      const decipher = createDecipheriv(ALGORITHM, this.encryptionKey, iv);
      decipher.setAuthTag(authTag);
      return decipher.update(ciphertext).toString('utf8') + decipher.final('utf8');
    } catch {
      this.logger.error('Failed to decrypt vault entry — key mismatch or corrupt data');
      return '';
    }
  }

  // ── Presentation helper ───────────────────────────────────────────────────

  private toSafeDto(entry: VaultEntryDocument) {
    const obj = entry.toObject() as any;
    return {
      _id: obj._id,
      key: obj.key,
      type: obj.type,
      description: obj.description,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
      // Sensitive values are always masked in API responses
      value: obj.type === 'sensitive' ? MASK : obj.value,
    };
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────

  async findAll(userId: string) {
    const entries = await this.vaultModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ key: 1 })
      .exec();
    return entries.map((e) => this.toSafeDto(e));
  }

  async create(userId: string, dto: CreateVaultEntryDto) {
    const existing = await this.vaultModel
      .findOne({ userId: new Types.ObjectId(userId), key: dto.key })
      .exec();
    if (existing) throw new ConflictException(`A vault entry with key "${dto.key}" already exists`);

    const storedValue =
      dto.type === 'sensitive' ? this.encrypt(dto.value) : dto.value;

    const entry = await this.vaultModel.create({
      userId: new Types.ObjectId(userId),
      key: dto.key,
      value: storedValue,
      type: dto.type ?? 'normal',
      description: dto.description ?? '',
    });
    return this.toSafeDto(entry);
  }

  async update(id: string, userId: string, dto: UpdateVaultEntryDto) {
    const entry = await this.vaultModel.findById(id).exec();
    if (!entry) throw new NotFoundException('Vault entry not found');
    if (entry.userId.toString() !== userId) throw new ForbiddenException('Access denied');

    if (dto.description !== undefined) entry.description = dto.description;
    if (dto.type !== undefined) entry.type = dto.type;
    if (dto.value !== undefined) {
      const effectiveType = dto.type ?? entry.type;
      entry.value = effectiveType === 'sensitive' ? this.encrypt(dto.value) : dto.value;
    } else if (dto.type !== undefined && dto.type !== entry.type) {
      // Re-encrypt or de-encrypt existing value when only type changes
      const currentPlain =
        entry.type === 'sensitive' ? this.decrypt(entry.value) : entry.value;
      entry.value =
        dto.type === 'sensitive' ? this.encrypt(currentPlain) : currentPlain;
    }

    await entry.save();
    return this.toSafeDto(entry);
  }

  async remove(id: string, userId: string) {
    const entry = await this.vaultModel.findById(id).exec();
    if (!entry) throw new NotFoundException('Vault entry not found');
    if (entry.userId.toString() !== userId) throw new ForbiddenException('Access denied');
    await entry.deleteOne();
    return { deleted: true };
  }

  /**
   * Returns a plain key→value map with all decrypted values.
   * Used exclusively by the runtime engine — never exposed via HTTP.
   */
  async getDecryptedMapForUser(userId: string): Promise<Record<string, string>> {
    const entries = await this.vaultModel
      .find({ userId: new Types.ObjectId(userId) })
      .exec();
    return Object.fromEntries(
      entries.map((e) => [
        e.key,
        e.type === 'sensitive' ? this.decrypt(e.value) : e.value,
      ]),
    );
  }
}
