import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VaultController } from './vault.controller';
import { VaultService } from './vault.service';
import { VaultEntry, VaultEntrySchema } from './schemas/vault-entry.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: VaultEntry.name, schema: VaultEntrySchema }]),
  ],
  controllers: [VaultController],
  providers: [VaultService],
  exports: [VaultService],
})
export class VaultModule {}
