import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FlowDocument = Flow & Document;

export type NodeType =
  | 'startNode'
  | 'endNode'
  | 'messageNode'
  | 'inputNode'
  | 'intentNode'
  | 'conditionNode'
  | 'switchNode'
  | 'delayNode'
  | 'apiNode'
  | 'variableNode'
  | 'redirectNode'
  | 'randomNode'
  | 'subflowNode';

export interface NodePosition {
  x: number;
  y: number;
}

export interface NodeSubdoc {
  id: string;
  type: NodeType;
  position: NodePosition;
  data: Record<string, unknown>;
  selected?: boolean;
  dragging?: boolean;
}

export interface EdgeSubdoc {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  animated?: boolean;
  type?: string;
}

@Schema({ timestamps: true })
export class Flow {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Bot', required: true, index: true })
  botId: Types.ObjectId;

  @Prop()
  description?: string;

  @Prop({ type: String })
  startNodeId?: string;

  @Prop({ default: 1 })
  version: number;

  @Prop({ default: false })
  published: boolean;

  @Prop({ default: false })
  isDefault: boolean;

  @Prop({ type: Array, default: [] })
  nodes: NodeSubdoc[];

  @Prop({ type: Array, default: [] })
  edges: EdgeSubdoc[];

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;
}

export const FlowSchema = SchemaFactory.createForClass(Flow);
FlowSchema.index({ botId: 1 });
FlowSchema.index({ botId: 1, isDefault: 1 });
