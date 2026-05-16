import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FlowsController } from './flows.controller';
import { FlowsService } from './flows.service';
import { Flow, FlowSchema } from './schemas/flow.schema';
import { Bot, BotSchema } from '../bots/schemas/bot.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Flow.name, schema: FlowSchema },
      { name: Bot.name, schema: BotSchema },
    ]),
  ],
  controllers: [FlowsController],
  providers: [FlowsService],
  exports: [FlowsService, MongooseModule],
})
export class FlowsModule {}
