import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NlpController } from './nlp.controller';
import { NlpService } from './nlp.service';
import { NlpManagerProvider } from './nlp-manager.provider';
import { Intent, IntentSchema } from './schemas/intent.schema';
import { Entity, EntitySchema } from './schemas/entity.schema';
import { Bot, BotSchema } from '../bots/schemas/bot.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Intent.name, schema: IntentSchema },
      { name: Entity.name, schema: EntitySchema },
      { name: Bot.name, schema: BotSchema },
    ]),
  ],
  controllers: [NlpController],
  providers: [NlpService, NlpManagerProvider],
  exports: [NlpService, NlpManagerProvider, MongooseModule],
})
export class NlpModule {}
