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

export interface OrganizationMember {
  _id: string;
  organizationId: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
  };
  inviteEmail: string;
  inviteToken?: string;
  inviteStatus: InviteStatus;
  role: MemberRole;
  permissions: MemberPermissions;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  _id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MyOrgResponse {
  org: Organization;
  membership: OrganizationMember;
}

export interface InviteInfo {
  email: string;
  role: MemberRole;
  organization: { _id: string; name: string };
}

export const PAGE_OPTIONS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'bots', label: 'Bots' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'conversations', label: 'Conversations' },
  { key: 'vault', label: 'Vault' },
  { key: 'billing', label: 'Billing' },
  { key: 'settings', label: 'Settings' },
  { key: 'nlp', label: 'NLP' },
] as const;
