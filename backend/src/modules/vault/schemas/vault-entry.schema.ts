import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VaultEntryDocument = VaultEntry & Document;

@Schema({ timestamps: true })
export class VaultEntry {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  key: string;

  /** Stored as plaintext for normal, or as "iv:authTag:ciphertext" (hex) for sensitive */
  @Prop({ required: true })
  value: string;

  @Prop({ enum: ['normal', 'sensitive'], default: 'normal' })
  type: 'normal' | 'sensitive';

  @Prop({ default: '' })
  description: string;
}

export const VaultEntrySchema = SchemaFactory.createForClass(VaultEntry);
VaultEntrySchema.index({ userId: 1, key: 1 }, { unique: true });
