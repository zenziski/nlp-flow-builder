import { useEffect, useState } from 'react';
import { BarChart2, MessageSquare, Users, Zap, Bot } from 'lucide-react';
import { botsService } from '../services/bots.service';
import BotDetailUsage, { BotSelector } from '../components/ui/BotDetailUsage';

type Overview = {
  totalSessions: number;
  totalMessages: number;
  uniqueUsers: number;
  chart: { label: string; sessions: number; messages: number }[];
  bots: { _id: string; name: string; sessions: number; messages: number }[];
};

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e4cfc4] bg-[#fff8f4] p-5">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#ffe6d8]">
        <Icon className="h-[18px] w-[18px] text-[var(--brand)]" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-widest text-[#9e7f6f]">{label}</p>
      <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

export default function UsagePage() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);

  useEffect(() => {
    botsService
      .getUsageOverview()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const max = data ? Math.max(...data.chart.map((c) => c.sessions), 1) : 1;
  const botMax = data ? Math.max(...data.bots.map((b) => b.sessions), 1) : 1;

  return (
    <div className="py-6 md:py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle mt-1">Real conversations across all bots — simulator sessions excluded</p>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-[#e4cfc4] bg-[#fff8f4] p-5">
              <div className="mb-3 h-9 w-9 rounded-xl bg-[#f0ddd4]" />
              <div className="mb-2 h-2.5 w-20 rounded bg-[#f0ddd4]" />
              <div className="h-8 w-24 rounded bg-[#f0ddd4]" />
            </div>
          ))}
        </div>
      ) : data ? (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard icon={Zap} label="Total sessions" value={data.totalSessions.toLocaleString()} />
          <StatCard icon={MessageSquare} label="Total messages" value={data.totalMessages.toLocaleString()} />
          <StatCard icon={Users} label="Unique users" value={data.uniqueUsers.toLocaleString()} />
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Bar chart */}
        <div className="surface-card p-5 md:p-6 lg:col-span-3">
          <div className="mb-5 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ffe6d8]">
              <BarChart2 className="h-[18px] w-[18px] text-[var(--brand)]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Sessions over time</h2>
              <p className="text-xs text-[#9e7f6f]">Last 6 months — all bots combined</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-end gap-2 h-36 animate-pulse">
              {[40, 65, 30, 80, 55, 70].map((h, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div className="w-full rounded-t-md bg-[#f0ddd4]" style={{ height: `${h}px` }} />
                  <div className="h-2 w-8 rounded bg-[#f0ddd4]" />
                </div>
              ))}
            </div>
          ) : data ? (
            <>
              <div className="flex items-end gap-2 h-36">
                {data.chart.map((c) => (
                  <div key={c.label} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-[10px] font-semibold text-slate-700">
                      {c.sessions > 0 ? c.sessions : ''}
                    </span>
                    <div
                      className="w-full rounded-t-md transition-all"
                      style={{
                        height: `${Math.max((c.sessions / max) * 96, c.sessions > 0 ? 4 : 0)}px`,
                        backgroundColor: c.sessions > 0 ? 'var(--brand)' : '#f0ddd4',
                        opacity: c.sessions > 0 ? 1 : 0.4,
                      }}
                    />
                    <span className="text-[10px] text-[#9e7f6f]">{c.label}</span>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>

        {/* Per-bot breakdown */}
        <div className="surface-card p-5 md:p-6 lg:col-span-2">
          <div className="mb-5 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ffe6d8]">
              <Bot className="h-[18px] w-[18px] text-[var(--brand)]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">By bot</h2>
              <p className="text-xs text-[#9e7f6f]">Sessions per bot</p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between">
                    <div className="h-2.5 w-24 rounded bg-[#f0ddd4]" />
                    <div className="h-2.5 w-8 rounded bg-[#f0ddd4]" />
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#f0ddd4]" />
                </div>
              ))}
            </div>
          ) : data && data.bots.length > 0 ? (
            <div className="space-y-4">
              {[...data.bots]
                .sort((a, b) => b.sessions - a.sessions)
                .map((bot) => (
                  <div key={bot._id}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="truncate text-sm font-semibold text-slate-800 max-w-[140px]">
                        {bot.name}
                      </span>
                      <span className="text-xs font-bold text-[var(--brand)]">
                        {bot.sessions.toLocaleString()} sessions
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#f0ddd4]">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${(bot.sessions / botMax) * 100}%`,
                          backgroundColor: 'var(--brand)',
                          minWidth: bot.sessions > 0 ? '4px' : '0',
                        }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-[#9e7f6f]">
                      {bot.messages.toLocaleString()} messages
                    </p>
                  </div>
                ))}
            </div>
          ) : (
            <div className="flex h-24 items-center justify-center text-sm text-[#9e7f6f]">
              No data yet
            </div>
          )}
        </div>
      </div>

      {/* Bot deep-dive */}
      {data && data.bots.length > 0 && (
        <div className="mt-2">
          <BotSelector
            bots={data.bots}
            selectedId={selectedBotId}
            onSelect={setSelectedBotId}
          />
          {selectedBotId && (
            <BotDetailUsage
              key={selectedBotId}
              botId={selectedBotId}
              botName={data.bots.find((b) => b._id === selectedBotId)?.name ?? ''}
            />
          )}
        </div>
      )}
    </div>
  );
}
