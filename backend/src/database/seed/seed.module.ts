import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedService } from './seed.service';
import { User, UserSchema } from '../../modules/auth/schemas/user.schema';
import { Bot, BotSchema } from '../../modules/bots/schemas/bot.schema';
import { Flow, FlowSchema } from '../../modules/flows/schemas/flow.schema';
import { Intent, IntentSchema } from '../../modules/nlp/schemas/intent.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Bot.name, schema: BotSchema },
      { name: Flow.name, schema: FlowSchema },
      { name: Intent.name, schema: IntentSchema },
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
