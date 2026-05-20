import { useEffect, useState } from 'react';
import { BarChart2, Bot, MessageSquare, Users, Zap } from 'lucide-react';
import { botsService } from '../services/bots.service';

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
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="surface-card p-5">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#ffe6d8]">
        <Icon className="h-[18px] w-[18px] text-[var(--brand)]" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9f7969]">{label}</p>
      <p className="mt-2 text-4xl font-bold text-slate-900">{value}</p>
      <p className="mt-2 text-xs text-[#836e62]">{sub}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    botsService
      .getUsageOverview()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const chartMax = data ? Math.max(...data.chart.map((c) => c.sessions), 1) : 1;
  const botMax = data ? Math.max(...data.bots.map((b) => b.sessions), 1) : 1;

  return (
    <div className="mx-auto max-w-6xl px-3 py-4 md:px-4 md:py-5">
      <div className="mb-8">
        <h1 className="page-title">Your Conversation Studio</h1>
        <p className="page-subtitle mt-2">Live activity across all your bots at a glance.</p>
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="surface-card animate-pulse p-5">
              <div className="mb-3 h-9 w-9 rounded-xl bg-[#f0ddd4]" />
              <div className="mb-2 h-2.5 w-20 rounded bg-[#f0ddd4]" />
              <div className="h-8 w-24 rounded bg-[#f0ddd4]" />
            </div>
          ))
        ) : data ? (
          <>
            <StatCard
              icon={Zap}
              label="Total sessions"
              value={data.totalSessions.toLocaleString()}
              sub="All-time conversations started"
            />
            <StatCard
              icon={MessageSquare}
              label="Total messages"
              value={data.totalMessages.toLocaleString()}
              sub="Messages exchanged across all bots"
            />
            <StatCard
              icon={Users}
              label="Unique users"
              value={data.uniqueUsers.toLocaleString()}
              sub="Individual users who started a conversation"
            />
          </>
        ) : null}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Sessions over time */}
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
            <div className="flex h-36 animate-pulse items-end gap-2">
              {[40, 65, 30, 80, 55, 70].map((h, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div className="w-full rounded-t-md bg-[#f0ddd4]" style={{ height: `${h}px` }} />
                  <div className="h-2 w-8 rounded bg-[#f0ddd4]" />
                </div>
              ))}
            </div>
          ) : data ? (
            <div className="flex h-36 items-end gap-2">
              {data.chart.map((c) => (
                <div key={c.label} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[10px] font-semibold text-slate-700">
                    {c.sessions > 0 ? c.sessions : ''}
                  </span>
                  <div
                    className="w-full rounded-t-md transition-all"
                    style={{
                      height: `${Math.max((c.sessions / chartMax) * 96, c.sessions > 0 ? 4 : 0)}px`,
                      backgroundColor: c.sessions > 0 ? 'var(--brand)' : '#f0ddd4',
                      opacity: c.sessions > 0 ? 1 : 0.4,
                    }}
                  />
                  <span className="text-[10px] text-[#9e7f6f]">{c.label}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Sessions per bot */}
        <div className="surface-card p-5 md:p-6 lg:col-span-2">
          <div className="mb-5 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ffe6d8]">
              <Bot className="h-[18px] w-[18px] text-[var(--brand)]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Sessions per bot</h2>
              <p className="text-xs text-[#9e7f6f]">All-time breakdown</p>
            </div>
          </div>
          {loading ? (
            <div className="animate-pulse space-y-3">
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
                      <span className="max-w-[140px] truncate text-sm font-semibold text-slate-800">
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
    </div>
  );
}


type Overview = {
  totalSessions: number;
  totalMessages: number;
  uniqueUsers: number;
};

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="surface-card p-5">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#ffe6d8]">
        <Icon className="h-[18px] w-[18px] text-[var(--brand)]" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9f7969]">{label}</p>
      <p className="mt-2 text-4xl font-bold text-slate-900">{value}</p>
      <p className="mt-2 text-xs text-[#836e62]">{sub}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    botsService
      .getUsageOverview()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-3 py-4 md:px-4 md:py-5">
      <div className="mb-8">
        <h1 className="page-title">Your Conversation Studio</h1>
        <p className="page-subtitle mt-2">Live activity across all your bots at a glance.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="surface-card animate-pulse p-5">
              <div className="mb-3 h-9 w-9 rounded-xl bg-[#f0ddd4]" />
              <div className="mb-2 h-2.5 w-20 rounded bg-[#f0ddd4]" />
              <div className="h-8 w-24 rounded bg-[#f0ddd4]" />
            </div>
          ))
        ) : data ? (
          <>
            <StatCard
              icon={Zap}
              label="Total sessions"
              value={data.totalSessions.toLocaleString()}
              sub="All-time conversations started"
            />
            <StatCard
              icon={MessageSquare}
              label="Total messages"
              value={data.totalMessages.toLocaleString()}
              sub="Messages exchanged across all bots"
            />
            <StatCard
              icon={Users}
              label="Unique users"
              value={data.uniqueUsers.toLocaleString()}
              sub="Individual users who started a conversation"
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
