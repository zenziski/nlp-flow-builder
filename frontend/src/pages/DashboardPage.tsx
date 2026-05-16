import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Plus, ArrowRight } from 'lucide-react';
import { useBotStore } from '../stores/useBotStore';

export default function DashboardPage() {
  const { bots, fetchBots, isLoading } = useBotStore();

  useEffect(() => { fetchBots(); }, []);

  const activeBots = bots.filter((b) => b.isActive).length;
  const languageCount = new Set(bots.map((b) => b.language)).size;

  return (
    <div className="mx-auto max-w-6xl px-3 py-4 md:px-4 md:py-5">
      <div className="mb-8">
        <h1 className="page-title">Your Conversation Studio</h1>
        <p className="page-subtitle mt-2">Create experiences people actually enjoy talking to.</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="surface-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9f7969]">Total Bots</p>
          <p className="mt-2 text-4xl font-bold text-slate-900">{bots.length}</p>
          <p className="mt-2 text-xs text-[#836e62]">Projects currently available in your studio</p>
        </div>
        <div className="surface-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9f7969]">Live Right Now</p>
          <p className="mt-2 text-4xl font-bold text-[var(--brand)]">{activeBots}</p>
          <p className="mt-2 text-xs text-[#836e62]">Bots currently active and handling conversations</p>
        </div>
        <div className="surface-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9f7969]">Languages</p>
          <p className="mt-2 text-4xl font-bold text-[var(--accent)]">{languageCount}</p>
          <p className="mt-2 text-xs text-[#836e62]">How multilingual your customer journeys are</p>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-900">Recently Updated</h2>
        <Link to="/bots" className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--brand)] transition-colors hover:text-[var(--brand-strong)]">
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="surface-panel p-6 text-sm text-slate-600">Loading bots...</div>
      ) : bots.length === 0 ? (
        <div className="surface-panel border-dashed p-10 text-center">
          <Bot className="mx-auto mb-3 h-9 w-9 text-slate-500" />
          <p className="font-semibold text-slate-800">No projects yet.</p>
          <Link to="/bots" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[var(--brand)] hover:text-[var(--brand-strong)]">
            <Plus className="h-3.5 w-3.5" /> Create your first conversation bot
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {bots.slice(0, 5).map((bot) => (
            <div key={bot._id} className="surface-panel flex items-center justify-between p-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_36px_-28px_rgba(119,66,41,0.9)]">
              <div>
                <p className="font-semibold text-slate-900">{bot.name}</p>
                <p className="mt-0.5 text-xs text-[#836e62]">{bot.language.toUpperCase()} · {bot.isActive ? 'Live' : 'Paused'}</p>
              </div>
              <Link to="/bots" className="text-slate-500 transition-colors hover:text-[var(--brand)]">
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
