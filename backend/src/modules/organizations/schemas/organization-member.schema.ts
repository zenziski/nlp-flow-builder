import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrganizationMemberDocument = OrganizationMember & Document;

export enum MemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

export enum InviteStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REVOKED = 'revoked',
}

export interface MemberPermissions {
  pages: string[];
  bots: string[];
}

@Schema({ timestamps: true })
export class OrganizationMember {
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  userId?: Types.ObjectId;

  @Prop({ required: true, lowercase: true })
  inviteEmail: string;

  @Prop({ type: String })
  inviteToken?: string;

  @Prop({ type: String, enum: InviteStatus, default: InviteStatus.PENDING })
  inviteStatus: InviteStatus;

  @Prop({ type: String, enum: MemberRole, default: MemberRole.MEMBER })
  role: MemberRole;

  @Prop({
    type: { pages: [String], bots: [String] },
    default: () => ({ pages: [], bots: [] }),
  })
  permissions: MemberPermissions;
}

export const OrganizationMemberSchema = SchemaFactory.createForClass(OrganizationMember);
OrganizationMemberSchema.index({ organizationId: 1, inviteEmail: 1 }, { unique: true });
