import { useEffect, useState } from 'react';
import {
  KeyRound,
  Plus,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  X,
  ShieldCheck,
  Copy,
  Check,
  Lock,
} from 'lucide-react';
import { useVaultStore } from '../stores/useVaultStore';
import type {
  VaultEntry,
  VaultEntryType,
  CreateVaultEntryPayload,
  UpdateVaultEntryPayload,
} from '../types/vault.types';

// ── Key validation ─────────────────────────────────────────────────────────
const KEY_RE = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

// ── Small helpers ──────────────────────────────────────────────────────────
function TypeBadge({ type }: { type: VaultEntryType }) {
  if (type === 'sensitive') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200">
        <Lock className="h-3 w-3" />
        Sensitive
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
      <ShieldCheck className="h-3 w-3" />
      Normal
    </span>
  );
}

function CopySnippet({ varKey }: { varKey: string }) {
  const [copied, setCopied] = useState(false);
  const snippet = `{{vault.${varKey}}}`;
  const handleCopy = () => {
    navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button
      onClick={handleCopy}
      title={`Copy ${snippet}`}
      className="group flex items-center gap-1.5 rounded-lg border border-[#e9d4c8] bg-[#fff6f0] px-2 py-1 text-xs font-mono text-[#a0654a] transition-colors hover:border-[#d35a2f] hover:bg-[#ffede3] hover:text-[#c04a28]"
    >
      <span>{snippet}</span>
      {copied ? (
        <Check className="h-3 w-3 text-emerald-500" />
      ) : (
        <Copy className="h-3 w-3 opacity-50 group-hover:opacity-100" />
      )}
    </button>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────
interface EntryFormProps {
  initial?: VaultEntry | null;
  onClose: () => void;
}

function EntryForm({ initial, onClose }: EntryFormProps) {
  const { create, update, isSaving } = useVaultStore();
  const isEdit = !!initial;

  const [key, setKey] = useState(initial?.key ?? '');
  const [value, setValue] = useState('');
  const [type, setType] = useState<VaultEntryType>(initial?.type ?? 'normal');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [showValue, setShowValue] = useState(false);
  const [keyError, setKeyError] = useState('');
  const [valueError, setValueError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;

    if (!isEdit) {
      if (!key.trim()) { setKeyError('Key is required'); valid = false; }
      else if (!KEY_RE.test(key.trim())) {
        setKeyError('Only letters, numbers and underscores. Must start with a letter or underscore.');
        valid = false;
      } else setKeyError('');
    }

    if (!isEdit && !value.trim()) {
      setValueError('Value is required');
      valid = false;
    } else if (isEdit && value && !value.trim()) {
      setValueError('Value cannot be blank');
      valid = false;
    } else setValueError('');

    if (!valid) return;

    try {
      if (isEdit) {
        const payload: UpdateVaultEntryPayload = { type, description };
        if (value.trim()) payload.value = value.trim();
        await update(initial!._id, payload);
      } else {
        const payload: CreateVaultEntryPayload = {
          key: key.trim(),
          value: value.trim(),
          type,
          description: description.trim(),
        };
        await create(payload);
      }
      onClose();
    } catch {
      // toast shown by store
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#1a0f0a]/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="surface-panel relative w-full max-w-md p-6">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand)] shadow-[0_12px_24px_-14px_rgba(211,90,47,0.9)]">
              <KeyRound className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isEdit ? 'Edit Variable' : 'New Variable'}
              </h2>
              <p className="text-xs text-[#9e7f6f]">
                {isEdit ? `Editing "${initial!.key}"` : 'Add to your vault'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-[#fff1e9] hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type toggle */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#7a5b4e]">
              Variable type
            </label>
            <div className="flex gap-2">
              {(['normal', 'sensitive'] as VaultEntryType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2 text-sm font-semibold transition-all ${
                    type === t
                      ? t === 'sensitive'
                        ? 'border-amber-300 bg-amber-50 text-amber-700 shadow-sm'
                        : 'border-emerald-300 bg-emerald-50 text-emerald-700 shadow-sm'
                      : 'border-[#e9d4c8] bg-white text-slate-500 hover:border-[#d4b5a6]'
                  }`}
                >
                  {t === 'sensitive' ? <Lock className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                  {t === 'sensitive' ? 'Sensitive' : 'Normal'}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[11px] text-[#a08070]">
              {type === 'sensitive'
                ? 'Value is encrypted at rest and masked in the UI.'
                : 'Value is stored as plain text.'}
            </p>
          </div>

          {/* Key (create only) */}
          {!isEdit && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#7a5b4e]">
                Key <span className="text-[#c05a2b]">*</span>
              </label>
              <input
                type="text"
                value={key}
                onChange={(e) => { setKey(e.target.value); setKeyError(''); }}
                placeholder="OPENAI_API_KEY"
                className="w-full rounded-xl border border-[#d7b9a9] bg-white px-3 py-2 font-mono text-sm text-slate-900 placeholder:text-[#b09080] focus:border-[#d35a2f] focus:outline-none focus:ring-2 focus:ring-[#ef6c3e]/20"
              />
              {keyError && <p className="mt-1 text-xs text-red-500">{keyError}</p>}
              <p className="mt-1 text-[11px] text-[#a08070]">
                Letters, numbers, underscores. Used as{' '}
                <code className="rounded bg-[#fff1e6] px-1 font-mono text-[10px] text-[#c05a2b]">
                  {`{{vault.${key || 'KEY'}}}`}
                </code>{' '}
                in flows.
              </p>
            </div>
          )}

          {/* Value */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#7a5b4e]">
              Value{' '}
              {!isEdit && <span className="text-[#c05a2b]">*</span>}
              {isEdit && (
                <span className="ml-1 font-normal text-[#a08070]">(leave blank to keep current)</span>
              )}
            </label>
            <div className="relative">
              <input
                type={showValue || type === 'normal' ? 'text' : 'password'}
                value={value}
                onChange={(e) => { setValue(e.target.value); setValueError(''); }}
                placeholder={isEdit ? '••••••••' : type === 'sensitive' ? 'sk-…' : 'my-value'}
                className="w-full rounded-xl border border-[#d7b9a9] bg-white px-3 py-2 pr-10 text-sm text-slate-900 placeholder:text-[#b09080] focus:border-[#d35a2f] focus:outline-none focus:ring-2 focus:ring-[#ef6c3e]/20"
              />
              {type === 'sensitive' && (
                <button
                  type="button"
                  onClick={() => setShowValue((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#b09080] hover:text-slate-700"
                >
                  {showValue ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              )}
            </div>
            {valueError && <p className="mt-1 text-xs text-red-500">{valueError}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#7a5b4e]">
              Description <span className="font-normal text-[#a08070]">(optional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this variable used for?"
              maxLength={500}
              className="w-full rounded-xl border border-[#d7b9a9] bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-[#b09080] focus:border-[#d35a2f] focus:outline-none focus:ring-2 focus:ring-[#ef6c3e]/20"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 rounded-xl border border-[#e0c5b8] py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-[#fff1e9] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--brand)] py-2 text-sm font-semibold text-white shadow-[0_10px_22px_-14px_rgba(211,90,47,0.9)] transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isSaving ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : null}
              {isEdit ? 'Save changes' : 'Create variable'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Confirm delete ─────────────────────────────────────────────────────────
function DeleteConfirm({
  entry,
  onConfirm,
  onCancel,
}: {
  entry: VaultEntry;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1a0f0a]/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="surface-panel relative w-full max-w-sm p-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 ring-1 ring-red-200">
          <Trash2 className="h-5 w-5 text-red-500" />
        </div>
        <h3 className="mb-1 text-base font-bold text-slate-900">Delete variable?</h3>
        <p className="mb-5 text-sm text-[#9e7f6f]">
          <span className="font-mono font-semibold text-slate-800">{entry.key}</span> will be
          permanently removed from your vault. Any flows using{' '}
          <span className="font-mono text-xs">{'{{vault.' + entry.key + '}}'}</span> will stop
          resolving it.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-[#e0c5b8] py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-[#fff1e9]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-500 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Empty state ─────────────────────────────────────────────────────────────
function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff1e9] ring-1 ring-[#efd6ca]">
        <KeyRound className="h-7 w-7 text-[#c4795c]" />
      </div>
      <h3 className="mb-1 text-base font-bold text-slate-900">Your vault is empty</h3>
      <p className="mb-6 max-w-xs text-sm text-[#9e7f6f]">
        Store API keys, tokens, and other fixed values here. Reference them in flows with{' '}
        <code className="rounded bg-[#fff1e6] px-1 font-mono text-xs text-[#c05a2b]">
          {'{{vault.KEY}}'}
        </code>
        .
      </p>
      <button
        onClick={onNew}
        className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_22px_-14px_rgba(211,90,47,0.9)] transition-opacity hover:opacity-90"
      >
        <Plus className="h-4 w-4" />
        Add first variable
      </button>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function VaultPage() {
  const { entries, isLoading, fetch, remove } = useVaultStore();
  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState<VaultEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VaultEntry | null>(null);

  useEffect(() => { fetch(); }, [fetch]);

  const handleEdit = (e: VaultEntry) => { setEditEntry(e); setShowForm(true); };
  const handleCloseForm = () => { setShowForm(false); setEditEntry(null); };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    await remove(deleteTarget._id);
    setDeleteTarget(null);
  };

  return (
    <div className="mx-auto max-w-4xl px-3 py-4 md:px-4 md:py-5">
      {/* Page header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--brand)] shadow-[0_10px_22px_-14px_rgba(211,90,47,0.9)]">
              <KeyRound className="h-4 w-4 text-white" />
            </div>
            <h1 className="page-title text-2xl md:text-3xl">Vault</h1>
          </div>
          <p className="page-subtitle">
            Fixed variables — API keys, secrets, and tokens accessible across all your bots.
          </p>
        </div>
        <button
          onClick={() => { setEditEntry(null); setShowForm(true); }}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_22px_-14px_rgba(211,90,47,0.9)] transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New variable
        </button>
      </div>

      {/* Info strip */}
      <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[#e9d4c8] bg-[#fff6f0] px-4 py-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#c07050]" />
        <p className="text-xs text-[#8a6050]">
          Reference any variable in your flows with{' '}
          <code className="rounded bg-[#ffe8d8] px-1 font-mono text-[11px] text-[#b84f2b]">
            {'{{vault.KEY}}'}
          </code>
          . Sensitive values are encrypted at rest and never exposed in the API.
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#efd6ca] border-t-[var(--brand)]" />
        </div>
      ) : entries.length === 0 ? (
        <EmptyState onNew={() => { setEditEntry(null); setShowForm(true); }} />
      ) : (
        <div className="surface-panel overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#efd6ca] text-left">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#9e7f6f]">Key</th>
                <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#9e7f6f] sm:table-cell">Type</th>
                <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#9e7f6f] md:table-cell">Description</th>
                <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#9e7f6f] lg:table-cell">Usage</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#9e7f6f]" />
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => (
                <tr
                  key={entry._id}
                  className={`group border-b border-[#f5e8e0] transition-colors last:border-0 hover:bg-[#fff9f6] ${
                    i % 2 === 0 ? '' : 'bg-[#fffaf7]'
                  }`}
                >
                  {/* Key */}
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-sm font-semibold text-slate-800">{entry.key}</span>
                    {/* Mobile badge */}
                    <div className="mt-1 sm:hidden">
                      <TypeBadge type={entry.type} />
                    </div>
                  </td>
                  {/* Type */}
                  <td className="hidden px-4 py-3.5 sm:table-cell">
                    <TypeBadge type={entry.type} />
                  </td>
                  {/* Description */}
                  <td className="hidden px-4 py-3.5 md:table-cell">
                    {entry.description ? (
                      <span className="text-sm text-[#8a7068]">{entry.description}</span>
                    ) : (
                      <span className="text-xs text-[#c0a898]">—</span>
                    )}
                  </td>
                  {/* Usage */}
                  <td className="hidden px-4 py-3.5 lg:table-cell">
                    <CopySnippet varKey={entry.key} />
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => handleEdit(entry)}
                        className="rounded-lg p-1.5 text-[#9e7f6f] transition-colors hover:bg-[#fff1e9] hover:text-slate-800"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(entry)}
                        className="rounded-lg p-1.5 text-[#9e7f6f] transition-colors hover:bg-red-50 hover:text-red-500"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-[#f0e0d6] px-5 py-2.5 text-xs text-[#b09080]">
            {entries.length} variable{entries.length !== 1 ? 's' : ''} · all accessible via{' '}
            <code className="font-mono text-[11px]">{'{{vault.KEY}}'}</code>
          </div>
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <EntryForm initial={editEntry} onClose={handleCloseForm} />
      )}
      {deleteTarget && (
        <DeleteConfirm
          entry={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
