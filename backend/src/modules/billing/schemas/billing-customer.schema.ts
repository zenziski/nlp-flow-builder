import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BillingCustomerDocument = BillingCustomer & Document;

@Schema({ timestamps: true })
export class BillingCustomer {
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, unique: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ required: true })
  asaasCustomerId: string;

  @Prop({ required: true })
  creditCardToken: string;

  @Prop({ required: true })
  cardBrand: string;

  /** Last 4 digits of the card */
  @Prop({ required: true })
  cardLastFour: string;

  @Prop({ required: true })
  holderName: string;
}

export const BillingCustomerSchema = SchemaFactory.createForClass(BillingCustomer);
