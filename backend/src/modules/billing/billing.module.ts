import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { AsaasService } from './asaas.service';
import {
  BillingCustomer,
  BillingCustomerSchema,
} from './schemas/billing-customer.schema';
import {
  BillingInvoice,
  BillingInvoiceSchema,
} from './schemas/billing-invoice.schema';
import {
  ConversationSession,
  ConversationSessionSchema,
} from '../runtime/schemas/conversation-session.schema';
import { Bot, BotSchema } from '../bots/schemas/bot.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BillingCustomer.name, schema: BillingCustomerSchema },
      { name: BillingInvoice.name, schema: BillingInvoiceSchema },
      { name: ConversationSession.name, schema: ConversationSessionSchema },
      { name: Bot.name, schema: BotSchema },
    ]),
  ],
  controllers: [BillingController],
  providers: [BillingService, AsaasService],
  exports: [BillingService],
})
export class BillingModule {}
