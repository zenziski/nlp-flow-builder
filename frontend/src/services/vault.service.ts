import apiClient from './api.client';
import type {
  VaultEntry,
  CreateVaultEntryPayload,
  UpdateVaultEntryPayload,
} from '../types/vault.types';

export const vaultService = {
  list(): Promise<VaultEntry[]> {
    return apiClient.get('/vault').then((r) => r.data.data);
  },

  create(payload: CreateVaultEntryPayload): Promise<VaultEntry> {
    return apiClient.post('/vault', payload).then((r) => r.data.data);
  },

  update(id: string, payload: UpdateVaultEntryPayload): Promise<VaultEntry> {
    return apiClient.patch(`/vault/${id}`, payload).then((r) => r.data.data);
  },

  remove(id: string): Promise<{ deleted: boolean }> {
    return apiClient.delete(`/vault/${id}`).then((r) => r.data.data);
  },
};
