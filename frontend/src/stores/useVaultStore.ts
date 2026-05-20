import { create } from 'zustand';
import { toast } from 'sonner';
import { vaultService } from '../services/vault.service';
import type {
  VaultEntry,
  CreateVaultEntryPayload,
  UpdateVaultEntryPayload,
} from '../types/vault.types';

interface VaultState {
  entries: VaultEntry[];
  isLoading: boolean;
  isSaving: boolean;

  fetch: () => Promise<void>;
  create: (payload: CreateVaultEntryPayload) => Promise<void>;
  update: (id: string, payload: UpdateVaultEntryPayload) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useVaultStore = create<VaultState>((set, get) => ({
  entries: [],
  isLoading: false,
  isSaving: false,

  async fetch() {
    set({ isLoading: true });
    try {
      const entries = await vaultService.list();
      set({ entries });
    } catch {
      toast.error('Failed to load vault entries');
    } finally {
      set({ isLoading: false });
    }
  },

  async create(payload) {
    set({ isSaving: true });
    try {
      const entry = await vaultService.create(payload);
      set((s) => ({ entries: [...s.entries, entry].sort((a, b) => a.key.localeCompare(b.key)) }));
      toast.success(`Variable "${payload.key}" created`);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to create variable';
      toast.error(msg);
      throw err;
    } finally {
      set({ isSaving: false });
    }
  },

  async update(id, payload) {
    set({ isSaving: true });
    try {
      const updated = await vaultService.update(id, payload);
      set((s) => ({
        entries: s.entries.map((e) => (e._id === id ? updated : e)),
      }));
      toast.success('Variable updated');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to update variable';
      toast.error(msg);
      throw err;
    } finally {
      set({ isSaving: false });
    }
  },

  async remove(id) {
    const entry = get().entries.find((e) => e._id === id);
    try {
      await vaultService.remove(id);
      set((s) => ({ entries: s.entries.filter((e) => e._id !== id) }));
      toast.success(`Variable "${entry?.key ?? ''}" deleted`);
    } catch {
      toast.error('Failed to delete variable');
    }
  },
}));
