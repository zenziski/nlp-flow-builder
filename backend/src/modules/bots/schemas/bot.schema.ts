import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BotDocument = Bot & Document;

export interface BotSettings {
  confidenceThreshold: number;
  fallbackMessage: string;
  welcomeMessage: string;
  sessionTimeoutMinutes: number;
}

@Schema({ timestamps: true })
export class Bot {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ default: 'pt', type: String })
  language: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  createdBy: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({
    type: Object,
    default: () => ({
      confidenceThreshold: 0.6,
      fallbackMessage: 'Sorry, I did not understand that.',
      welcomeMessage: 'Hello! How can I help you today?',
      sessionTimeoutMinutes: 0,
    }),
  })
  settings: BotSettings;

  /** Public identifier used in Runtime API calls */
  @Prop({ type: String, index: true, sparse: true })
  clientId?: string;

  /** Secret used to authenticate Runtime API calls (stored as-is; treat as sensitive) */
  @Prop({ type: String })
  clientSecret?: string;

  /** Default flow used by the Runtime API when no flowId is provided */
  @Prop({ type: Types.ObjectId, ref: 'Flow' })
  mainFlowId?: Types.ObjectId;
}

export const BotSchema = SchemaFactory.createForClass(Bot);
BotSchema.index({ createdBy: 1 });
