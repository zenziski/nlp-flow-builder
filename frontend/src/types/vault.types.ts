export type VaultEntryType = 'normal' | 'sensitive';

export interface VaultEntry {
  _id: string;
  key: string;
  value: string; // masked as '••••••••' for sensitive entries
  type: VaultEntryType;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVaultEntryPayload {
  key: string;
  value: string;
  type: VaultEntryType;
  description?: string;
}

export interface UpdateVaultEntryPayload {
  value?: string;
  type?: VaultEntryType;
  description?: string;
}
