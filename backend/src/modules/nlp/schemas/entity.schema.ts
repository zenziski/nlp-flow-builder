import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EntityDocument = Entity & Document;

export interface EntityValue {
  value: string;
  synonyms: string[];
}

@Schema({ timestamps: true })
export class Entity {
  @Prop({ type: Types.ObjectId, ref: 'Bot', required: true, index: true })
  botId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ enum: ['enum', 'regex', 'trim'], default: 'enum' })
  type: string;

  @Prop({ type: Array, default: [] })
  values: EntityValue[];
}

export const EntitySchema = SchemaFactory.createForClass(Entity);
EntitySchema.index({ botId: 1, name: 1 }, { unique: true });
