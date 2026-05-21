import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { Organization, OrganizationDocument } from './schemas/organization.schema';
import {
  OrganizationMember,
  OrganizationMemberDocument,
  MemberRole,
  InviteStatus,
} from './schemas/organization-member.schema';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectModel(Organization.name) private orgModel: Model<OrganizationDocument>,
    @InjectModel(OrganizationMember.name)
    private memberModel: Model<OrganizationMemberDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  /** Called during user registration to bootstrap the first org. */
  async createForUser(
    userId: string,
    name: string,
    email: string,
  ): Promise<OrganizationDocument> {
    const org = await this.orgModel.create({
      name: `${name}'s Workspace`,
      ownerId: new Types.ObjectId(userId),
    });

    await this.memberModel.create({
      organizationId: org._id,
      userId: new Types.ObjectId(userId),
      inviteEmail: email.toLowerCase(),
      inviteStatus: InviteStatus.ACCEPTED,
      role: MemberRole.OWNER,
      permissions: { pages: [], bots: [] },
    });

    await this.userModel.updateOne(
      { _id: new Types.ObjectId(userId) },
      { organizationId: org._id },
    );

    return org;
  }

  async getMyOrganization(userId: string, organizationId: string) {
    if (!organizationId) throw new NotFoundException('No organization linked to this account');

    const [org, membership] = await Promise.all([
      this.orgModel.findById(organizationId).exec(),
      this.memberModel
        .findOne({
          organizationId: new Types.ObjectId(organizationId),
          userId: new Types.ObjectId(userId),
          inviteStatus: InviteStatus.ACCEPTED,
        })
        .exec(),
    ]);

    if (!org || !membership) throw new NotFoundException('Organization not found');
    return { org, membership };
  }

  async getMembership(userId: string, organizationId: string) {
    return this.memberModel
      .findOne({
        organizationId: new Types.ObjectId(organizationId),
        userId: new Types.ObjectId(userId),
        inviteStatus: InviteStatus.ACCEPTED,
      })
      .exec();
  }

  async isAdminOrOwner(userId: string, organizationId: string): Promise<boolean> {
    const m = await this.memberModel
      .findOne({
        organizationId: new Types.ObjectId(organizationId),
        userId: new Types.ObjectId(userId),
        inviteStatus: InviteStatus.ACCEPTED,
        role: { $in: [MemberRole.OWNER, MemberRole.ADMIN] },
      })
      .exec();
    return !!m;
  }

  async canAccessBot(
    userId: string,
    organizationId: string,
    botId: string,
  ): Promise<boolean> {
    const m = await this.getMembership(userId, organizationId);
    if (!m) return false;
    if (m.role !== MemberRole.MEMBER) return true;
    return m.permissions.bots.includes(botId);
  }

  async getAccessibleBotIds(
    userId: string,
    organizationId: string,
  ): Promise<string[] | null> {
    const m = await this.getMembership(userId, organizationId);
    if (!m) return [];
    if (m.role !== MemberRole.MEMBER) return null; // null = all bots
    return m.permissions.bots;
  }

  async getMembers(organizationId: string, requesterId: string) {
    await this.assertMemberAccess(organizationId, requesterId);
    return this.memberModel
      .find({ organizationId: new Types.ObjectId(organizationId) })
      .populate('userId', 'name email')
      .sort({ createdAt: 1 })
      .exec();
  }

  async inviteMember(
    organizationId: string,
    dto: InviteMemberDto,
    requesterId: string,
  ) {
    await this.assertAdminAccess(organizationId, requesterId);

    const existing = await this.memberModel
      .findOne({
        organizationId: new Types.ObjectId(organizationId),
        inviteEmail: dto.email.toLowerCase(),
      })
      .exec();

    if (existing) throw new ConflictException('This email is already a member or has a pending invite');

    const inviteToken = randomBytes(32).toString('hex');
    const member = await this.memberModel.create({
      organizationId: new Types.ObjectId(organizationId),
      inviteEmail: dto.email.toLowerCase(),
      inviteToken,
      inviteStatus: InviteStatus.PENDING,
      role: dto.role ?? MemberRole.MEMBER,
      permissions: {
        pages: dto.permissions?.pages ?? [],
        bots: dto.permissions?.bots ?? [],
      },
    });

    return { ...member.toObject(), inviteToken };
  }

  async updateMember(
    organizationId: string,
    memberId: string,
    dto: UpdateMemberDto,
    requesterId: string,
  ) {
    await this.assertAdminAccess(organizationId, requesterId);

    const member = await this.memberModel
      .findOne({
        _id: new Types.ObjectId(memberId),
        organizationId: new Types.ObjectId(organizationId),
      })
      .exec();

    if (!member) throw new NotFoundException('Member not found');
    if (member.role === MemberRole.OWNER) {
      throw new ForbiddenException('Cannot modify the organization owner');
    }

    if (dto.role !== undefined) member.role = dto.role;
    if (dto.permissions !== undefined) {
      member.permissions = {
        pages: dto.permissions.pages ?? member.permissions.pages,
        bots: dto.permissions.bots ?? member.permissions.bots,
      };
    }

    return member.save();
  }

  async removeMember(
    organizationId: string,
    memberId: string,
    requesterId: string,
  ) {
    await this.assertAdminAccess(organizationId, requesterId);

    const member = await this.memberModel
      .findOne({
        _id: new Types.ObjectId(memberId),
        organizationId: new Types.ObjectId(organizationId),
      })
      .exec();

    if (!member) throw new NotFoundException('Member not found');
    if (member.role === MemberRole.OWNER) {
      throw new ForbiddenException('Cannot remove the organization owner');
    }

    await member.deleteOne();
    return { success: true };
  }

  async getInviteInfo(token: string) {
    const member = await this.memberModel
      .findOne({ inviteToken: token, inviteStatus: InviteStatus.PENDING })
      .populate('organizationId', 'name')
      .exec();

    if (!member) throw new NotFoundException('Invalid or expired invite token');

    return {
      email: member.inviteEmail,
      role: member.role,
      organization: member.organizationId,
    };
  }

  async acceptInvite(dto: AcceptInviteDto) {
    const member = await this.memberModel
      .findOne({ inviteToken: dto.token, inviteStatus: InviteStatus.PENDING })
      .exec();

    if (!member) throw new NotFoundException('Invalid or expired invite token');

    let user = await this.userModel.findOne({ email: member.inviteEmail }).exec();

    if (!user) {
      if (!dto.name || !dto.password) {
        throw new ForbiddenException(
          'name and password are required to create a new account',
        );
      }
      const hashed = await bcrypt.hash(dto.password, 12);
      user = await this.userModel.create({
        name: dto.name,
        email: member.inviteEmail,
        password: hashed,
        organizationId: member.organizationId,
      });
    } else if (!user.organizationId) {
      await this.userModel.updateOne(
        { _id: user._id },
        { organizationId: member.organizationId },
      );
    }

    member.userId = user._id as Types.ObjectId;
    member.inviteStatus = InviteStatus.ACCEPTED;
    member.inviteToken = undefined;
    await member.save();

    return { success: true, email: member.inviteEmail };
  }

  private async assertAdminAccess(organizationId: string, userId: string) {
    const isAdmin = await this.isAdminOrOwner(userId, organizationId);
    if (!isAdmin) throw new ForbiddenException('Admin or owner access required');
  }

  private async assertMemberAccess(organizationId: string, userId: string) {
    const m = await this.getMembership(userId, organizationId);
    if (!m) throw new ForbiddenException('Access denied');
  }
}
