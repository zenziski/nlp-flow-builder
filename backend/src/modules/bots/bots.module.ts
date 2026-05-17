import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BotsController } from './bots.controller';
import { BotsService } from './bots.service';
import { Bot, BotSchema } from './schemas/bot.schema';
import {
  ConversationSession,
  ConversationSessionSchema,
} from '../runtime/schemas/conversation-session.schema';
import { Flow, FlowSchema } from '../flows/schemas/flow.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Bot.name, schema: BotSchema },
      { name: ConversationSession.name, schema: ConversationSessionSchema },
      { name: Flow.name, schema: FlowSchema },
    ]),
  ],
  controllers: [BotsController],
  providers: [BotsService],
  exports: [BotsService, MongooseModule],
})
export class BotsModule {}
