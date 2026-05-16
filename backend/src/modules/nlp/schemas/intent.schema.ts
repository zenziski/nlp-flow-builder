import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type IntentDocument = Intent & Document;

@Schema({ timestamps: true })
export class Intent {
  @Prop({ type: Types.ObjectId, ref: 'Bot', required: true, index: true })
  botId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ type: [String], default: [] })
  examples: string[];

  @Prop({ type: [String], default: [] })
  answers: string[];

  @Prop({ type: [String], default: [] })
  entities: string[];

  @Prop({ default: 'pt' })
  language: string;
}

export const IntentSchema = SchemaFactory.createForClass(Intent);
IntentSchema.index({ botId: 1, name: 1 }, { unique: true });
