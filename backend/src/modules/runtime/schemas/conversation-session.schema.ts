import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConversationSessionDocument = ConversationSession & Document;

export interface ConversationTurn {
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  nodeId?: string;
}

@Schema({ timestamps: true })
export class ConversationSession {
  @Prop({ type: Types.ObjectId, ref: 'Bot', required: true, index: true })
  botId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Flow', required: true })
  flowId: Types.ObjectId;

  @Prop({ required: true })
  userId: string;

  @Prop({ type: String })
  currentNodeId?: string;

  @Prop({ type: Object, default: {} })
  context: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  variables: Record<string, unknown>;

  @Prop({ type: Array, default: [] })
  history: ConversationTurn[];

  @Prop({ enum: ['active', 'completed', 'expired', 'error'], default: 'active' })
  status: string;

  @Prop({ default: false })
  isSimulator: boolean;

  @Prop({ type: Date, default: () => new Date() })
  lastActivityAt: Date;
}

export const ConversationSessionSchema = SchemaFactory.createForClass(ConversationSession);
ConversationSessionSchema.index({ botId: 1, userId: 1 });
ConversationSessionSchema.index({ status: 1 });
ConversationSessionSchema.index({ isSimulator: 1, createdAt: 1 });
ConversationSessionSchema.index({ lastActivityAt: 1 });
