import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Bot, Eye, EyeOff } from 'lucide-react';
import { teamService } from '../services/team.service';
import type { InviteInfo } from '../types/team.types';
import { MemberRole } from '../types/team.types';

const ROLE_LABELS: Record<MemberRole, string> = {
  [MemberRole.OWNER]: 'Owner',
  [MemberRole.ADMIN]: 'Admin',
  [MemberRole.MEMBER]: 'Member',
};

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [info, setInfo] = useState<InviteInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid invite link');
      setLoading(false);
      return;
    }
    teamService
      .getInviteInfo(token)
      .then((data) => {
        setInfo(data);
        setLoading(false);
      })
      .catch(() => {
        setError('This invite link is invalid or has already been used.');
        setLoading(false);
      });
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (!name.trim() || password.length < 8) return;

    setSubmitting(true);
    try {
      await teamService.acceptInvite(token, name.trim(), password);
      setDone(true);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed to accept invite');
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Done state ── */
  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fdf6f2] p-4">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100">
            <svg
              className="h-8 w-8 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Account created!</h1>
          <p className="mt-2 text-sm text-slate-500">
            You've successfully joined{' '}
            <strong>{info?.organization.name}</strong>. Log in to get started.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="mt-6 w-full rounded-xl bg-[#d35a2f] py-3 text-sm font-semibold text-white shadow-[0_12px_24px_-14px_rgba(211,90,47,0.8)] transition-opacity hover:opacity-90"
          >
            Go to login
          </button>
        </div>
      </div>
    );
  }

  /* ── Loading / error ── */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fdf6f2]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ead5c8] border-t-[#d35a2f]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fdf6f2] p-4">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100">
            <svg className="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-slate-900">Invite not found</h1>
          <p className="mt-1 text-sm text-slate-500">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-5 w-full rounded-xl border border-[#ead5c8] py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-[#fff8f5]"
          >
            Go to login
          </button>
        </div>
      </div>
    );
  }

  /* ── Main form ── */
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fdf6f2] p-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d35a2f] shadow-[0_16px_30px_-18px_rgba(211,90,47,0.95)]">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#9e7f6f]">
            NLP BUILDER
          </p>
        </div>

        <div className="rounded-2xl border border-[#ead5c8] bg-white p-6 shadow-sm">
          {/* Org badge */}
          <div className="mb-5 rounded-xl bg-[#fff8f5] p-3 text-center">
            <p className="text-xs text-slate-500">
              You've been invited to join
            </p>
            <p className="mt-0.5 font-bold text-slate-900">{info?.organization.name}</p>
            <span className="mt-1 inline-block rounded-full border border-[#f5c9b5] bg-[#fff1e9] px-2 py-0.5 text-[11px] font-semibold text-[#d35a2f]">
              {ROLE_LABELS[info?.role ?? MemberRole.MEMBER]}
            </span>
          </div>

          <h2 className="mb-1 text-base font-bold text-slate-900">Create your account</h2>
          <p className="mb-5 text-xs text-slate-400">
            Joining as <strong>{info?.email}</strong>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="w-full rounded-xl border border-[#ead5c8] px-3 py-2.5 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-300 focus:border-[#d35a2f] focus:ring-2 focus:ring-[#d35a2f]/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  className="w-full rounded-xl border border-[#ead5c8] px-3 py-2.5 pr-10 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-300 focus:border-[#d35a2f] focus:ring-2 focus:ring-[#d35a2f]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !name.trim() || password.length < 8}
              className="w-full rounded-xl bg-[#d35a2f] py-3 text-sm font-semibold text-white shadow-[0_12px_24px_-14px_rgba(211,90,47,0.8)] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? 'Creating account…' : 'Accept invite & join'}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="font-semibold text-[#d35a2f] hover:underline"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}
