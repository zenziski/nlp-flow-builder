import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import {
  BillingCustomer,
  BillingCustomerDocument,
} from './schemas/billing-customer.schema';
import {
  BillingInvoice,
  BillingInvoiceDocument,
} from './schemas/billing-invoice.schema';
import {
  ConversationSession,
  ConversationSessionDocument,
} from '../runtime/schemas/conversation-session.schema';
import { Bot, BotDocument } from '../bots/schemas/bot.schema';
import { AsaasService } from './asaas.service';
import { SavePaymentMethodDto } from './dto/save-payment-method.dto';

/** R$ 0,10 per session = 10 centavos */
const SESSION_PRICE_CENTS = 10;

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    @InjectModel(BillingCustomer.name)
    private readonly customerModel: Model<BillingCustomerDocument>,
    @InjectModel(BillingInvoice.name)
    private readonly invoiceModel: Model<BillingInvoiceDocument>,
    @InjectModel(ConversationSession.name)
    private readonly sessionModel: Model<ConversationSessionDocument>,
    @InjectModel(Bot.name)
    private readonly botModel: Model<BotDocument>,
    private readonly asaasService: AsaasService,
  ) {}

  // ─── Payment Method ────────────────────────────────────────────────────────

  async savePaymentMethod(
    organizationId: string,
    dto: SavePaymentMethodDto,
    remoteIp: string,
  ): Promise<{ cardBrand: string; cardLastFour: string; holderName: string }> {
    const orgObjectId = new Types.ObjectId(organizationId);

    // Reuse existing ASAAS customer if we already have one
    const existing = await this.customerModel
      .findOne({ organizationId: orgObjectId })
      .lean()
      .exec();

    let asaasCustomerId: string;
    if (existing) {
      asaasCustomerId = existing.asaasCustomerId;
    } else {
      const asaasCustomer = await this.asaasService.createCustomer({
        name: dto.holderInfo.name,
        email: dto.holderInfo.email,
        cpfCnpj: dto.holderInfo.cpfCnpj,
      });
      asaasCustomerId = asaasCustomer.id;
    }

    const tokenResult = await this.asaasService.tokenizeCreditCard({
      customer: asaasCustomerId,
      creditCard: {
        holderName: dto.card.holderName,
        number: dto.card.number,
        expiryMonth: dto.card.expiryMonth,
        expiryYear: dto.card.expiryYear,
        ccv: dto.card.ccv,
      },
      creditCardHolderInfo: {
        name: dto.holderInfo.name,
        email: dto.holderInfo.email,
        cpfCnpj: dto.holderInfo.cpfCnpj,
        postalCode: dto.holderInfo.postalCode,
        addressNumber: dto.holderInfo.addressNumber,
        phone: dto.holderInfo.phone,
      },
      remoteIp,
    });

    await this.customerModel.findOneAndUpdate(
      { organizationId: orgObjectId },
      {
        organizationId: orgObjectId,
        asaasCustomerId,
        creditCardToken: tokenResult.creditCardToken,
        cardBrand: tokenResult.creditCardBrand,
        cardLastFour: tokenResult.creditCardNumber,
        holderName: dto.card.holderName,
      },
      { upsert: true, new: true },
    );

    return {
      cardBrand: tokenResult.creditCardBrand,
      cardLastFour: tokenResult.creditCardNumber,
      holderName: dto.card.holderName,
    };
  }

  async getPaymentMethod(
    organizationId: string,
  ): Promise<{ cardBrand: string; cardLastFour: string; holderName: string } | null> {
    const customer = await this.customerModel
      .findOne({ organizationId: new Types.ObjectId(organizationId) })
      .select('cardBrand cardLastFour holderName')
      .lean()
      .exec();
    return customer ?? null;
  }

  async removePaymentMethod(organizationId: string): Promise<void> {
    await this.customerModel
      .deleteOne({ organizationId: new Types.ObjectId(organizationId) })
      .exec();
  }

  // ─── Invoices ──────────────────────────────────────────────────────────────

  async getInvoices(organizationId: string) {
    return this.invoiceModel
      .find({ organizationId: new Types.ObjectId(organizationId) })
      .sort({ periodStart: -1 })
      .limit(24)
      .lean()
      .exec();
  }

  // ─── Billing run ───────────────────────────────────────────────────────────

  /** Runs automatically on the 1st of each month at 01:00 (server time). */
  @Cron('0 3 1 * *')
  async runMonthlyBilling(): Promise<void> {
    this.logger.log('Starting monthly billing run');

    const now = new Date();
    // period = previous calendar month
    const periodEnd = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodStart = new Date(periodEnd.getFullYear(), periodEnd.getMonth() - 1, 1);

    const customers = await this.customerModel.find().lean().exec();
    this.logger.log(`Processing ${customers.length} organization(s)`);

    for (const customer of customers) {
      await this.chargeOrganization(
        customer.organizationId.toString(),
        periodStart,
        periodEnd,
        customer,
      );
    }

    this.logger.log('Monthly billing run complete');
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private async chargeOrganization(
    organizationId: string,
    periodStart: Date,
    periodEnd: Date,
    customer: any,
  ): Promise<void> {
    try {
      const bots = await this.botModel
        .find({ organizationId: new Types.ObjectId(organizationId) })
        .select('_id')
        .lean()
        .exec();

      if (!bots.length) return;

      const botIds = bots.map((b) => b._id);

      const sessionCount = await this.sessionModel.countDocuments({
        botId: { $in: botIds },
        isSimulator: false,
        createdAt: { $gte: periodStart, $lt: periodEnd },
      });

      if (sessionCount === 0) {
        await this.invoiceModel.create({
          organizationId: new Types.ObjectId(organizationId),
          periodStart,
          periodEnd,
          sessionCount: 0,
          amountCents: 0,
          status: 'no_usage',
        });
        return;
      }

      const amountCents = sessionCount * SESSION_PRICE_CENTS;
      const amountReais = amountCents / 100;
      const dueDate = periodEnd.toISOString().slice(0, 10);
      const periodLabel = periodStart.toISOString().slice(0, 7);

      const payment = await this.asaasService.createPayment({
        customer: customer.asaasCustomerId,
        billingType: 'CREDIT_CARD',
        value: amountReais,
        dueDate,
        creditCardToken: customer.creditCardToken,
        description: `NLP Flow Builder — ${sessionCount} sessões (${periodLabel})`,
      });

      const isPaid =
        payment.status === 'CONFIRMED' || payment.status === 'RECEIVED';

      await this.invoiceModel.create({
        organizationId: new Types.ObjectId(organizationId),
        periodStart,
        periodEnd,
        sessionCount,
        amountCents,
        asaasPaymentId: payment.id,
        status: isPaid ? 'paid' : 'pending',
      });

      this.logger.log(
        `Org ${organizationId}: charged R$ ${amountReais.toFixed(2)} for ${sessionCount} sessions`,
      );
    } catch (err: any) {
      this.logger.error(`Failed to charge org ${organizationId}`, err?.message);
      await this.invoiceModel.create({
        organizationId: new Types.ObjectId(organizationId),
        periodStart,
        periodEnd,
        sessionCount: 0,
        amountCents: 0,
        status: 'failed',
        errorMessage: err?.message,
      });
    }
  }
}
