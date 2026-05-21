import { create } from 'zustand';
import { teamService } from '../services/team.service';
import type { OrganizationMember, Organization, MemberPermissions, MemberRole } from '../types/team.types';

interface TeamStore {
  org: Organization | null;
  membership: OrganizationMember | null;
  members: OrganizationMember[];
  isLoading: boolean;

  fetchMyOrg: () => Promise<void>;
  fetchMembers: () => Promise<void>;
  invite: (
    email: string,
    role: MemberRole,
    permissions: MemberPermissions,
  ) => Promise<{ inviteToken: string }>;
  updateMember: (
    id: string,
    data: { role?: MemberRole; permissions?: MemberPermissions },
  ) => Promise<void>;
  removeMember: (id: string) => Promise<void>;
  reset: () => void;
}

export const useTeamStore = create<TeamStore>((set, get) => ({
  org: null,
  membership: null,
  members: [],
  isLoading: false,

  fetchMyOrg: async () => {
    set({ isLoading: true });
    try {
      const data = await teamService.getMyOrg();
      set({ org: data.org, membership: data.membership });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMembers: async () => {
    const members = await teamService.getMembers();
    set({ members });
  },

  invite: async (email, role, permissions) => {
    const result = await teamService.invite(email, role, permissions);
    await get().fetchMembers();
    return { inviteToken: result.inviteToken };
  },

  updateMember: async (id, data) => {
    await teamService.updateMember(id, data);
    await get().fetchMembers();
  },

  removeMember: async (id) => {
    await teamService.removeMember(id);
    set((s) => ({ members: s.members.filter((m) => m._id !== id) }));
  },

  reset: () => set({ org: null, membership: null, members: [], isLoading: false }),
}));
