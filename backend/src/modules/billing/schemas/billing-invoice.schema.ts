import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BillingInvoiceDocument = BillingInvoice & Document;

export type InvoiceStatus = 'pending' | 'paid' | 'failed' | 'no_usage';

@Schema({ timestamps: true })
export class BillingInvoice {
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ required: true })
  periodStart: Date;

  @Prop({ required: true })
  periodEnd: Date;

  @Prop({ required: true, default: 0 })
  sessionCount: number;

  /** Amount in centavos (R$ 0,10 = 10 centavos per session) */
  @Prop({ required: true, default: 0 })
  amountCents: number;

  @Prop()
  asaasPaymentId?: string;

  @Prop({ enum: ['pending', 'paid', 'failed', 'no_usage'], default: 'pending' })
  status: InvoiceStatus;

  @Prop()
  errorMessage?: string;
}

export const BillingInvoiceSchema = SchemaFactory.createForClass(BillingInvoice);
BillingInvoiceSchema.index({ organizationId: 1, periodStart: -1 });
