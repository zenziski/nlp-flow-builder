import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  UserPlus,
  Users,
  Shield,
  ShieldCheck,
  Crown,
  Trash2,
  Settings2,
  Copy,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Mail,
  Link,
} from 'lucide-react';
import { useTeamStore } from '../stores/useTeamStore';
import { useBotStore } from '../stores/useBotStore';
import {
  MemberRole,
  InviteStatus,
  PAGE_OPTIONS,
  type OrganizationMember,
  type MemberPermissions,
} from '../types/team.types';

/* ─── Helpers ─────────────────────────────────────────────────────────── */

const ROLE_CONFIG: Record<MemberRole, { label: string; icon: typeof Crown; color: string }> = {
  [MemberRole.OWNER]: { label: 'Owner', icon: Crown, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  [MemberRole.ADMIN]: { label: 'Admin', icon: ShieldCheck, color: 'text-[#d35a2f] bg-[#fff1e9] border-[#f5c9b5]' },
  [MemberRole.MEMBER]: { label: 'Member', icon: Users, color: 'text-slate-600 bg-slate-50 border-slate-200' },
};

const STATUS_CONFIG: Record<InviteStatus, { label: string; color: string }> = {
  [InviteStatus.ACCEPTED]: { label: 'Active', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  [InviteStatus.PENDING]: { label: 'Pending invite', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  [InviteStatus.REVOKED]: { label: 'Revoked', color: 'text-slate-500 bg-slate-50 border-slate-200' },
};

function initials(name?: string, email?: string) {
  const src = name ?? email ?? '?';
  return src.slice(0, 2).toUpperCase();
}

function avatarBg(str: string) {
  const hues = [215, 280, 160, 30, 350, 190, 60];
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % hues.length;
  return `hsl(${hues[h]}, 55%, 58%)`;
}

/* ─── Permissions Modal ──────────────────────────────────────────────── */

interface PermissionsModalProps {
  member: OrganizationMember;
  bots: { _id: string; name: string }[];
  onClose: () => void;
}

function PermissionsModal({ member, bots, onClose }: PermissionsModalProps) {
  const updateMember = useTeamStore((s) => s.updateMember);
  const [role, setRole] = useState<MemberRole>(member.role);
  const [pages, setPages] = useState<string[]>(member.permissions.pages);
  const [selectedBots, setSelectedBots] = useState<string[]>(member.permissions.bots);
  const [saving, setSaving] = useState(false);

  const displayName =
    member.userId?.name ??
    member.userId?.email ??
    member.inviteEmail;

  const isAdmin = role !== MemberRole.MEMBER;

  function togglePage(key: string) {
    setPages((p) => (p.includes(key) ? p.filter((x) => x !== key) : [...p, key]));
  }
  function toggleBot(id: string) {
    setSelectedBots((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateMember(member._id, {
        role,
        permissions: { pages, bots: selectedBots },
      });
      toast.success('Permissions updated');
      onClose();
    } catch {
      toast.error('Failed to update permissions');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-[#ead5c8] bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ead5c8] px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-white"
              style={{ background: avatarBg(member.inviteEmail) }}
            >
              {initials(member.userId?.name, member.inviteEmail)}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{displayName}</p>
              <p className="text-xs text-slate-400">{member.inviteEmail}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          {/* Role */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Role
            </label>
            <div className="flex gap-2">
              {([MemberRole.MEMBER, MemberRole.ADMIN] as MemberRole[]).map((r) => {
                const cfg = ROLE_CONFIG[r];
                const Icon = cfg.icon;
                return (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition-all ${
                      role === r
                        ? 'border-[#d35a2f] bg-[#fff1e9] text-[#d35a2f]'
                        : 'border-[#ead5c8] text-slate-500 hover:border-[#f5c9b5] hover:bg-[#fff8f5]'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
            {isAdmin && (
              <p className="mt-2 text-xs text-amber-600">
                Admins have full access to all bots and pages.
              </p>
            )}
          </div>

          {!isAdmin && (
            <>
              {/* Page access */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Page access
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {PAGE_OPTIONS.map(({ key, label }) => (
                    <label
                      key={key}
                      className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-[#ead5c8] px-3 py-2 transition-colors hover:bg-[#fff8f5]"
                    >
                      <input
                        type="checkbox"
                        checked={pages.includes(key)}
                        onChange={() => togglePage(key)}
                        className="h-3.5 w-3.5 rounded accent-[#d35a2f]"
                      />
                      <span className="text-xs font-medium text-slate-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Bot access */}
              {bots.length > 0 && (
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Bot access
                  </label>
                  <div className="space-y-1.5">
                    {bots.map((bot) => (
                      <label
                        key={bot._id}
                        className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-[#ead5c8] px-3 py-2 transition-colors hover:bg-[#fff8f5]"
                      >
                        <input
                          type="checkbox"
                          checked={selectedBots.includes(bot._id)}
                          onChange={() => toggleBot(bot._id)}
                          className="h-3.5 w-3.5 rounded accent-[#d35a2f]"
                        />
                        <span className="text-xs font-medium text-slate-700">{bot.name}</span>
                      </label>
                    ))}
                  </div>
                  {selectedBots.length === 0 && (
                    <p className="mt-1.5 text-xs text-slate-400">
                      No bots selected — this member won't see any bots.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex gap-2 border-t border-[#ead5c8] px-6 py-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-[#ead5c8] py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-xl bg-[#d35a2f] py-2 text-sm font-semibold text-white shadow-[0_8px_20px_-10px_rgba(211,90,47,0.7)] transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Invite Modal ───────────────────────────────────────────────────── */

interface InviteModalProps {
  orgId: string;
  bots: { _id: string; name: string }[];
  onClose: () => void;
}

function InviteModal({ orgId: _, bots, onClose }: InviteModalProps) {
  const invite = useTeamStore((s) => s.invite);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<MemberRole>(MemberRole.MEMBER);
  const [pages, setPages] = useState<string[]>([]);
  const [selectedBots, setSelectedBots] = useState<string[]>([]);
  const [showPerms, setShowPerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const inviteLink = inviteToken
    ? `${window.location.origin}/invite/${inviteToken}`
    : null;

  async function handleInvite() {
    if (!email.trim()) return;
    setLoading(true);
    try {
      const result = await invite(email.trim(), role, { pages, bots: selectedBots });
      setInviteToken(result.inviteToken);
      toast.success('Invite created');
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed to invite');
    } finally {
      setLoading(false);
    }
  }

  function copyLink() {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isAdmin = role !== MemberRole.MEMBER;

  if (inviteToken) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-md rounded-2xl border border-[#ead5c8] bg-white p-6 shadow-xl">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff1e9]">
            <Link className="h-6 w-6 text-[#d35a2f]" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Invite link ready</h3>
          <p className="mt-1 text-sm text-slate-500">
            Share this link with <strong>{email}</strong>. It expires once used.
          </p>
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#ead5c8] bg-[#fff8f5] p-3">
            <code className="flex-1 truncate text-xs text-slate-600">{inviteLink}</code>
            <button
              onClick={copyLink}
              className="flex-shrink-0 rounded-lg p-1.5 transition-colors hover:bg-[#fff1e9]"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-600" />
              ) : (
                <Copy className="h-4 w-4 text-slate-400" />
              )}
            </button>
          </div>
          <button
            onClick={onClose}
            className="mt-4 w-full rounded-xl bg-[#d35a2f] py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_-10px_rgba(211,90,47,0.7)] transition-opacity hover:opacity-90"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-[#ead5c8] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#ead5c8] px-6 py-4">
          <h3 className="text-base font-bold text-slate-900">Invite team member</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {/* Email */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="w-full rounded-xl border border-[#ead5c8] py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-300 focus:border-[#d35a2f] focus:ring-2 focus:ring-[#d35a2f]/20"
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Role
            </label>
            <div className="flex gap-2">
              {([MemberRole.MEMBER, MemberRole.ADMIN] as MemberRole[]).map((r) => {
                const cfg = ROLE_CONFIG[r];
                const Icon = cfg.icon;
                return (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition-all ${
                      role === r
                        ? 'border-[#d35a2f] bg-[#fff1e9] text-[#d35a2f]'
                        : 'border-[#ead5c8] text-slate-500 hover:border-[#f5c9b5] hover:bg-[#fff8f5]'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Permissions (member only) */}
          {!isAdmin && (
            <div className="rounded-xl border border-[#ead5c8] overflow-hidden">
              <button
                onClick={() => setShowPerms((v) => !v)}
                className="flex w-full items-center justify-between bg-[#fff8f5] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 transition-colors hover:bg-[#fff1e9]"
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5" />
                  <span>Permissions</span>
                </div>
                {showPerms ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>

              {showPerms && (
                <div className="space-y-4 p-4">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Pages
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {PAGE_OPTIONS.map(({ key, label }) => (
                        <label
                          key={key}
                          className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#ead5c8] px-3 py-2 transition-colors hover:bg-[#fff8f5]"
                        >
                          <input
                            type="checkbox"
                            checked={pages.includes(key)}
                            onChange={() =>
                              setPages((p) =>
                                p.includes(key) ? p.filter((x) => x !== key) : [...p, key],
                              )
                            }
                            className="h-3.5 w-3.5 rounded accent-[#d35a2f]"
                          />
                          <span className="text-xs font-medium text-slate-700">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {bots.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Bots
                      </p>
                      <div className="space-y-1.5">
                        {bots.map((bot) => (
                          <label
                            key={bot._id}
                            className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#ead5c8] px-3 py-2 transition-colors hover:bg-[#fff8f5]"
                          >
                            <input
                              type="checkbox"
                              checked={selectedBots.includes(bot._id)}
                              onChange={() =>
                                setSelectedBots((p) =>
                                  p.includes(bot._id)
                                    ? p.filter((x) => x !== bot._id)
                                    : [...p, bot._id],
                                )
                              }
                              className="h-3.5 w-3.5 rounded accent-[#d35a2f]"
                            />
                            <span className="text-xs font-medium text-slate-700">{bot.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 border-t border-[#ead5c8] px-6 py-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-[#ead5c8] py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleInvite}
            disabled={loading || !email.trim()}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#d35a2f] py-2 text-sm font-semibold text-white shadow-[0_8px_20px_-10px_rgba(211,90,47,0.7)] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <UserPlus className="h-4 w-4" />
            {loading ? 'Inviting…' : 'Send invite'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Member Row ─────────────────────────────────────────────────────── */

interface MemberRowProps {
  member: OrganizationMember;
  bots: { _id: string; name: string }[];
  currentMemberId?: string;
  isAdmin: boolean;
}

function MemberRow({ member, bots, currentMemberId, isAdmin }: MemberRowProps) {
  const removeMember = useTeamStore((s) => s.removeMember);
  const [showPermsModal, setShowPermsModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [removing, setRemoving] = useState(false);

  const roleCfg = ROLE_CONFIG[member.role];
  const statusCfg = STATUS_CONFIG[member.inviteStatus];
  const RoleIcon = roleCfg.icon;

  const displayName =
    member.userId?.name ?? member.inviteEmail.split('@')[0];
  const email = member.userId?.email ?? member.inviteEmail;
  const isSelf = !!currentMemberId && member.userId?._id === currentMemberId;
  const isOwner = member.role === MemberRole.OWNER;
  const canEdit = isAdmin && !isOwner && !isSelf;
  const isPending = member.inviteStatus === InviteStatus.PENDING;

  async function handleConfirmRemove() {
    setRemoving(true);
    try {
      await removeMember(member._id);
      toast.success(isPending ? 'Invite revoked' : 'Member removed');
      setShowConfirm(false);
    } catch {
      toast.error(isPending ? 'Failed to revoke invite' : 'Failed to remove member');
    } finally {
      setRemoving(false);
    }
  }

  const permSummary =
    member.role !== MemberRole.MEMBER
      ? 'Full access'
      : `${member.permissions.pages.length} page${member.permissions.pages.length !== 1 ? 's' : ''}, ${
          member.permissions.bots.length
        } bot${member.permissions.bots.length !== 1 ? 's' : ''}`;

  return (
    <>
      <div className="flex items-center gap-4 rounded-2xl border border-[#ead5c8] bg-white px-4 py-3.5 transition-shadow hover:shadow-sm">
        {/* Avatar */}
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
          style={{ background: avatarBg(email) }}
        >
          {initials(member.userId?.name, email)}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">{displayName}</span>
            {isSelf && (
              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                you
              </span>
            )}
            <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${roleCfg.color}`}>
              <RoleIcon className="h-3 w-3" />
              {roleCfg.label}
            </span>
            <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusCfg.color}`}>
              {statusCfg.label}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-slate-400">{email}</p>
        </div>

        {/* Permission summary */}
        <div className="hidden flex-shrink-0 items-center gap-1.5 md:flex">
          <Shield className="h-3.5 w-3.5 text-slate-300" />
          <span className="text-xs text-slate-400">{permSummary}</span>
        </div>

        {/* Actions */}
        {canEdit && (
          <div className="flex flex-shrink-0 items-center gap-1.5">
            {member.inviteStatus === InviteStatus.PENDING ? (
              <button
                onClick={() => setShowConfirm(true)}
                disabled={removing}
                className="flex items-center gap-1.5 rounded-xl border border-red-100 px-3 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" />
                <span>Revoke invite</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => setShowPermsModal(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-[#ead5c8] px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-[#f5c9b5] hover:bg-[#fff8f5] hover:text-[#d35a2f]"
                >
                  <Settings2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
                <button
                  onClick={() => setShowConfirm(true)}
                  disabled={removing}
                  className="rounded-xl border border-transparent p-1.5 text-slate-300 transition-colors hover:border-red-100 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {showPermsModal && (
        <PermissionsModal
          member={member}
          bots={bots}
          onClose={() => setShowPermsModal(false)}
        />
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
          <div className="relative w-full max-w-sm rounded-2xl border border-[#ead5c8] bg-white p-6 shadow-xl">
            <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
              <Trash2 className="h-5 w-5 text-red-500" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-slate-900">
              {isPending ? 'Revoke invite?' : 'Remove member?'}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {isPending
                ? <>The invite for <strong>{member.inviteEmail}</strong> will be cancelled.</>
                : <><strong>{displayName}</strong> will lose access to this workspace.</>}
            </p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl border border-[#ead5c8] py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRemove}
                disabled={removing}
                className="flex-1 rounded-xl bg-red-500 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {removing ? 'Removing…' : isPending ? 'Revoke' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── TeamPage ───────────────────────────────────────────────────────── */

export default function TeamPage() {
  const { org, membership, members, isLoading, fetchMyOrg, fetchMembers } = useTeamStore();
  const bots = useBotStore((s) => s.bots);
  const fetchBots = useBotStore((s) => s.fetchBots);
  const [showInvite, setShowInvite] = useState(false);

  const isAdmin =
    membership?.role === MemberRole.OWNER || membership?.role === MemberRole.ADMIN;

  useEffect(() => {
    fetchMyOrg();
    fetchMembers();
    fetchBots();
  }, []);

  const accepted = members.filter((m) => m.inviteStatus === InviteStatus.ACCEPTED);
  const pending = members.filter((m) => m.inviteStatus === InviteStatus.PENDING);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#ead5c8] border-t-[#d35a2f]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{org?.name ?? 'Team'}</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {accepted.length} active member{accepted.length !== 1 ? 's' : ''}
            {pending.length > 0 && ` · ${pending.length} pending invite${pending.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 rounded-xl bg-[#d35a2f] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_-10px_rgba(211,90,47,0.7)] transition-opacity hover:opacity-90"
          >
            <UserPlus className="h-4 w-4" />
            Invite member
          </button>
        )}
      </div>

      {/* Members */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Active members
        </h2>
        <div className="space-y-2">
          {accepted.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#ead5c8] py-10 text-center text-sm text-slate-400">
              No members yet
            </div>
          ) : (
            accepted.map((m) => (
              <MemberRow
                key={m._id}
                member={m}
                bots={bots as any}
                currentMemberId={membership?.userId?._id ?? (membership as any)?.userId}
                isAdmin={isAdmin}
              />
            ))
          )}
        </div>
      </section>

      {/* Pending invites */}
      {pending.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Pending invites
          </h2>
          <div className="space-y-2">
            {pending.map((m) => (
              <MemberRow
                key={m._id}
                member={m}
                bots={bots as any}
                currentMemberId={undefined}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        </section>
      )}

      {/* Invite modal */}
      {showInvite && (
        <InviteModal
          orgId={org?._id ?? ''}
          bots={bots as any}
          onClose={() => setShowInvite(false)}
        />
      )}
    </div>
  );
}
