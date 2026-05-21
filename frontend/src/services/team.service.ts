import apiClient from './api.client';
import type { MyOrgResponse, OrganizationMember, InviteInfo, MemberPermissions, MemberRole } from '../types/team.types';

export const teamService = {
  getMyOrg: () =>
    apiClient.get<{ data: MyOrgResponse }>('/organizations/me').then((r) => r.data.data),

  getMembers: () =>
    apiClient.get<{ data: OrganizationMember[] }>('/organizations/members').then((r) => r.data.data),

  invite: (email: string, role: MemberRole, permissions: MemberPermissions) =>
    apiClient
      .post<OrganizationMember & { inviteToken: string }>('/organizations/members/invite', {
        email,
        role,
        permissions,
      })
      .then((r) => r.data),

  updateMember: (
    id: string,
    data: { role?: MemberRole; permissions?: MemberPermissions },
  ) =>
    apiClient
      .patch<OrganizationMember>(`/organizations/members/${id}`, data)
      .then((r) => r.data),

  removeMember: (id: string) =>
    apiClient.delete(`/organizations/members/${id}`).then((r) => r.data),

  getInviteInfo: (token: string) =>
    apiClient.get<InviteInfo>(`/organizations/invite/${token}`).then((r) => r.data),

  acceptInvite: (token: string, name?: string, password?: string) =>
    apiClient
      .post('/organizations/accept-invite', { token, name, password })
      .then((r) => r.data),
};
