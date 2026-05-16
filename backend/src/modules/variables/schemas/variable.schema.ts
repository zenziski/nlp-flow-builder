import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VariableDocument = Variable & Document;

@Schema({ timestamps: true })
export class Variable {
  @Prop({ type: Types.ObjectId, ref: 'Bot', required: true, index: true })
  botId: Types.ObjectId;

  @Prop({ required: true })
  key: string;

  @Prop({ type: Object })
  defaultValue?: unknown;

  @Prop()
  description?: string;

  @Prop({ enum: ['global', 'session', 'temp'], default: 'session' })
  scope: string;
}

export const VariableSchema = SchemaFactory.createForClass(Variable);
VariableSchema.index({ botId: 1, key: 1 }, { unique: true });
