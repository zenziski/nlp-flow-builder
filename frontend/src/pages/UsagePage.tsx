import { useEffect, useRef, useState } from 'react';
import {
  Activity,
  BarChart2,
  Bot,
  Brain,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  GitFork,
  Hourglass,
  RefreshCw,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';
import ExcelJS from 'exceljs';
import { botsService } from '../services/bots.service';
import PathGraph from '../components/ui/PathGraph';

// ── Types ─────────────────────────────────────────────────────────────────────

type Overview = {
  totalSessions: number;
  totalMessages: number;
  uniqueUsers: number;
  chart: { label: string; sessions: number; messages: number }[];
  bots: { _id: string; name: string; sessions: number; messages: number }[];
};

type DetailedUsage = Awaited<ReturnType<typeof botsService.getDetailedUsage>>;
type PathData = Awaited<ReturnType<typeof botsService.getPathAnalysis>>;
type Tab = 'sessions' | 'engagement' | 'paths';

// ── Helpers ───────────────────────────────────────────────────────────────────

const DOW_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

function formatHour(h: number): string {
  if (h === 0) return '12am';
  if (h < 12) return `${h}am`;
  if (h === 12) return '12pm';
  return `${h - 12}pm`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <span className="text-xs text-[#9e7f6f]">
          {count} · {pct.toFixed(0)}%
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-[#f0ddd4]">
        <div
          className="h-2 rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color, minWidth: count > 0 ? '4px' : '0' }}
        />
      </div>
    </div>
  );
}

// ── Excel export ──────────────────────────────────────────────────────────────

const BRAND_HEX = 'D35A2F';
const HEADER_BG_HEX = 'FFF0E4';

function styleHeader(ws: ExcelJS.Worksheet, row: number, cols: number) {
  const r = ws.getRow(row);
  for (let c = 1; c <= cols; c++) {
    const cell = r.getCell(c);
    cell.font = { bold: true, color: { argb: `FF${BRAND_HEX}` } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${HEADER_BG_HEX}` } };
    cell.border = { bottom: { style: 'thin', color: { argb: `FF${BRAND_HEX}` } } };
  }
}

async function exportBotAnalytics(botName: string, data: DetailedUsage, pathData: PathData | null) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'MBRF NLP Flow Builder';
  wb.created = new Date();

  const summary = wb.addWorksheet('Summary');
  summary.columns = [
    { header: 'Metric', key: 'metric', width: 30 },
    { header: 'Value', key: 'value', width: 20 },
  ];
  styleHeader(summary, 1, 2);
  summary.addRows([
    { metric: 'Bot name', value: botName },
    { metric: 'Exported at', value: new Date().toLocaleString() },
    { metric: 'Total sessions', value: data.totalSessions },
    { metric: 'Total messages', value: data.totalMessages },
    { metric: 'Unique users', value: data.uniqueUsers },
    { metric: 'Returning users', value: data.returningUsers },
    { metric: 'Avg messages / session', value: data.avgMessagesPerSession },
    { metric: 'Avg session duration (seconds)', value: data.avgSessionDurationSec },
    { metric: 'Completion rate (%)', value: data.completionRate },
  ]);

  const status = wb.addWorksheet('Status Breakdown');
  status.columns = [
    { header: 'Status', key: 'status', width: 18 },
    { header: 'Count', key: 'count', width: 12 },
    { header: '% of total', key: 'pct', width: 14 },
  ];
  styleHeader(status, 1, 3);
  const totalSt = data.statusBreakdown.active + data.statusBreakdown.completed + data.statusBreakdown.expired + data.statusBreakdown.error;
  for (const r of [
    { status: 'Completed', count: data.statusBreakdown.completed },
    { status: 'Active', count: data.statusBreakdown.active },
    { status: 'Expired', count: data.statusBreakdown.expired },
    { status: 'Error', count: data.statusBreakdown.error },
  ]) {
    status.addRow({ ...r, pct: totalSt > 0 ? +((r.count / totalSt) * 100).toFixed(1) : 0 });
  }

  const monthly = wb.addWorksheet('Monthly Trend');
  monthly.columns = [
    { header: 'Month', key: 'label', width: 14 },
    { header: 'Sessions', key: 'sessions', width: 12 },
    { header: 'Messages', key: 'messages', width: 12 },
  ];
  styleHeader(monthly, 1, 3);
  monthly.addRows(data.chart);

  const hourly = wb.addWorksheet('Hourly Distribution');
  hourly.columns = [
    { header: 'Hour', key: 'hour', width: 10 },
    { header: 'Label', key: 'label', width: 12 },
    { header: 'Sessions', key: 'count', width: 12 },
  ];
  styleHeader(hourly, 1, 3);
  hourly.addRows(data.hourly.map((h) => ({ hour: h.hour, label: formatHour(h.hour), count: h.count })));

  const dow = wb.addWorksheet('Day of Week');
  dow.columns = [
    { header: 'Day', key: 'day', width: 14 },
    { header: 'Sessions', key: 'count', width: 12 },
  ];
  styleHeader(dow, 1, 2);
  const DOW_ORDER = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dow.addRows([...data.dow].sort((a, b) => DOW_ORDER.indexOf(a.day) - DOW_ORDER.indexOf(b.day)));

  const intents = wb.addWorksheet('Top Intents');
  intents.columns = [
    { header: 'Rank', key: 'rank', width: 8 },
    { header: 'Intent', key: 'intent', width: 30 },
    { header: 'Triggers', key: 'count', width: 12 },
    { header: 'Avg confidence (%)', key: 'avgConf', width: 20 },
  ];
  styleHeader(intents, 1, 4);
  intents.addRows(data.topIntents.map((t, i) => ({ rank: i + 1, intent: t.intent, count: t.count, avgConf: +((t.avgScore * 100).toFixed(1)) })));

  const sessions = wb.addWorksheet('Recent Sessions');
  sessions.columns = [
    { header: 'Session ID', key: 'sessionId', width: 28 },
    { header: 'User ID', key: 'userId', width: 28 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Messages', key: 'messageCount', width: 12 },
    { header: 'Created at', key: 'createdAt', width: 22 },
    { header: 'Last activity', key: 'lastActivityAt', width: 22 },
  ];
  styleHeader(sessions, 1, 6);
  sessions.addRows(
    data.recentActivity.map((s) => ({
      ...s,
      createdAt: new Date(s.createdAt).toLocaleString(),
      lastActivityAt: new Date(s.lastActivityAt).toLocaleString(),
    })),
  );

  if (pathData) {
    const nodes = wb.addWorksheet('Path - Nodes');
    nodes.columns = [
      { header: 'Node ID', key: 'id', width: 28 },
      { header: 'Label', key: 'label', width: 28 },
      { header: 'Type', key: 'type', width: 16 },
      { header: 'Visit count', key: 'visitCount', width: 14 },
    ];
    styleHeader(nodes, 1, 4);
    nodes.addRows([...pathData.nodes].sort((a, b) => b.visitCount - a.visitCount));

    const edges = wb.addWorksheet('Path - Edges');
    edges.columns = [
      { header: 'From node', key: 'from', width: 28 },
      { header: 'To node', key: 'to', width: 28 },
      { header: 'Traversal count', key: 'count', width: 18 },
    ];
    styleHeader(edges, 1, 3);
    edges.addRows([...pathData.edges].sort((a, b) => b.count - a.count));
  }

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const slug = botName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  a.download = `${slug}-analytics-${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function UsagePage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const [botData, setBotData] = useState<DetailedUsage | null>(null);
  const [pathData, setPathData] = useState<PathData | null>(null);
  const [botLoading, setBotLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('sessions');
  const [selectorOpen, setSelectorOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    botsService
      .getUsageOverview()
      .then(setOverview)
      .catch(console.error);
  }, []);

  const loadBotData = (silent = false) => {
    if (!selectedBotId) return;
    if (!silent) setBotLoading(true);
    else setRefreshing(true);
    Promise.all([
      botsService.getDetailedUsage(selectedBotId),
      botsService.getPathAnalysis(selectedBotId),
    ])
      .then(([detail, path]) => {
        setBotData(detail);
        setPathData(path);
      })
      .catch(console.error)
      .finally(() => {
        setBotLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    if (!selectedBotId) {
      setBotData(null);
      setPathData(null);
      return;
    }
    loadBotData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBotId]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(e.target as Node)) {
        setSelectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedBotName = overview?.bots.find((b) => b._id === selectedBotId)?.name ?? '';

  // Derived values for bot detail
  const hourMax = botData ? Math.max(...botData.hourly.map((h) => h.count), 1) : 1;
  const dowMax = botData ? Math.max(...botData.dow.map((d) => d.count), 1) : 1;
  const chartMax = botData ? Math.max(...botData.chart.map((c) => c.sessions), 1) : 1;
  const intentMax = botData?.topIntents.length ? botData.topIntents[0].count : 1;
  const totalStatusSessions = botData
    ? botData.statusBreakdown.active + botData.statusBreakdown.completed + botData.statusBreakdown.expired + botData.statusBreakdown.error
    : 0;
  const peakHour = botData?.hourly.reduce((best, h) => (h.count > best.count ? h : best), botData.hourly[0]);
  const peakDay = botData?.dow.reduce((best, d) => (d.count > best.count ? d : best), botData.dow[0]);

  // ── Tab 1: Sessions ──────────────────────────────────────────────────────────

  const renderSessionsTab = () => {
    if (!selectedBotId) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ffe6d8]">
            <Bot className="h-7 w-7 text-[var(--brand)]" />
          </div>
          <p className="text-base font-semibold text-slate-800">Select a bot to see session analytics</p>
          <p className="mt-1.5 text-sm text-[#9e7f6f]">Use the bot selector in the top-right corner</p>
        </div>
      );
    }

    if (botLoading) {
      return (
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            <div className="h-52 rounded-2xl bg-[#f0ddd4] lg:col-span-2" />
            <div className="h-52 rounded-2xl bg-[#f0ddd4] lg:col-span-3" />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="h-44 rounded-2xl bg-[#f0ddd4]" />
            <div className="h-44 rounded-2xl bg-[#f0ddd4]" />
          </div>
        </div>
      );
    }

    if (!botData) return null;

    return (
      <>
        {/* Row 1 — session status + monthly trend */}
        <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="surface-card p-5 lg:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffe6d8]">
                <Activity className="h-4 w-4 text-[var(--brand)]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Session status</h3>
            </div>
            <div className="space-y-3">
              <StatusBar label="Completed" count={botData.statusBreakdown.completed} total={totalStatusSessions} color="var(--accent)" />
              <StatusBar label="Active" count={botData.statusBreakdown.active} total={totalStatusSessions} color="var(--brand)" />
              <StatusBar label="Expired" count={botData.statusBreakdown.expired} total={totalStatusSessions} color="#f59e0b" />
              <StatusBar label="Error" count={botData.statusBreakdown.error} total={totalStatusSessions} color="#ef4444" />
            </div>
          </div>

          <div className="surface-card p-5 lg:col-span-3">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffe6d8]">
                <TrendingUp className="h-4 w-4 text-[var(--brand)]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Sessions by month</h3>
            </div>
            <div className="flex h-28 items-end gap-2">
              {botData.chart.map((c) => (
                <div key={c.label} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[9px] font-semibold text-slate-700">{c.sessions > 0 ? c.sessions : ''}</span>
                  <div
                    className="w-full rounded-t-md transition-all"
                    style={{
                      height: `${Math.max((c.sessions / chartMax) * 72, c.sessions > 0 ? 4 : 0)}px`,
                      backgroundColor: c.sessions > 0 ? 'var(--brand)' : '#f0ddd4',
                      opacity: c.sessions > 0 ? 1 : 0.4,
                    }}
                  />
                  <span className="text-[9px] text-[#9e7f6f]">{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2 — peak hours + busiest days */}
        <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="surface-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffe6d8]">
                  <Clock className="h-4 w-4 text-[var(--brand)]" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Peak hours</h3>
              </div>
              {peakHour && peakHour.count > 0 && (
                <span className="rounded-full bg-[#ffe6d8] px-2.5 py-0.5 text-xs font-semibold text-[var(--brand)]">
                  Peak: {formatHour(peakHour.hour)}
                </span>
              )}
            </div>
            <div className="flex h-20 items-end gap-px overflow-hidden">
              {botData.hourly.map((h) => (
                <div key={h.hour} className="group relative flex flex-1 flex-col items-center" title={`${formatHour(h.hour)}: ${h.count} sessions`}>
                  <div
                    className="w-full rounded-sm transition-all"
                    style={{
                      height: `${Math.max((h.count / hourMax) * 64, h.count > 0 ? 3 : 0)}px`,
                      backgroundColor:
                        h.hour === peakHour?.hour && h.count > 0
                          ? 'var(--brand)'
                          : h.count > 0
                          ? 'rgba(239,108,62,0.45)'
                          : '#f0ddd4',
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-1.5 flex justify-between text-[9px] text-[#9e7f6f]">
              <span>12am</span>
              <span>6am</span>
              <span>12pm</span>
              <span>6pm</span>
              <span>11pm</span>
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffe6d8]">
                  <BarChart2 className="h-4 w-4 text-[var(--brand)]" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Busiest days</h3>
              </div>
              {peakDay && peakDay.count > 0 && (
                <span className="rounded-full bg-[#ffe6d8] px-2.5 py-0.5 text-xs font-semibold text-[var(--brand)]">
                  Peak: {DOW_FULL[botData.dow.indexOf(peakDay)]}
                </span>
              )}
            </div>
            <div className="flex h-20 items-end gap-2">
              {botData.dow.map((d) => (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[9px] font-semibold text-slate-700">{d.count > 0 ? d.count : ''}</span>
                  <div
                    className="w-full rounded-t-sm transition-all"
                    style={{
                      height: `${Math.max((d.count / dowMax) * 52, d.count > 0 ? 3 : 0)}px`,
                      backgroundColor: d === peakDay && d.count > 0 ? 'var(--brand)' : d.count > 0 ? 'rgba(239,108,62,0.45)' : '#f0ddd4',
                    }}
                  />
                  <span className="text-[9px] text-[#9e7f6f]">{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  };

  // ── Tab 2: Engagement ────────────────────────────────────────────────────────

  const renderEngagementTab = () => {
    if (!selectedBotId) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ffe6d8]">
            <Bot className="h-7 w-7 text-[var(--brand)]" />
          </div>
          <p className="text-base font-semibold text-slate-800">Select a bot to see engagement metrics</p>
          <p className="mt-1.5 text-sm text-[#9e7f6f]">Use the bot selector in the top-right corner</p>
        </div>
      );
    }

    if (botLoading) {
      return (
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            <div className="h-56 rounded-2xl bg-[#f0ddd4] lg:col-span-3" />
            <div className="h-56 rounded-2xl bg-[#f0ddd4] lg:col-span-2" />
          </div>
          <div className="h-32 rounded-2xl bg-[#f0ddd4]" />
        </div>
      );
    }

    if (!botData) return null;

    return (
      <>
        {/* Row 1 — top intents + recent sessions */}
        <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="surface-card p-5 lg:col-span-3">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffe6d8]">
                <Brain className="h-4 w-4 text-[var(--brand)]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Top intents</h3>
                <p className="text-[11px] text-[#9e7f6f]">Ranked by trigger frequency</p>
              </div>
            </div>
            {botData.topIntents.length === 0 ? (
              <div className="flex h-24 items-center justify-center text-sm text-[#9e7f6f]">
                No intent data yet — intents are tracked as users interact
              </div>
            ) : (
              <div className="space-y-3">
                {botData.topIntents.map((intent, idx) => (
                  <div key={intent.intent}>
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#ffe6d8] text-[10px] font-bold text-[var(--brand)]">
                          {idx + 1}
                        </span>
                        <span className="truncate text-sm font-semibold text-slate-800">{intent.intent}</span>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-2">
                        <span className="rounded-full bg-[#f0f9f8] px-2 py-0.5 text-[11px] font-semibold text-[var(--accent)]">
                          {(intent.avgScore * 100).toFixed(0)}% conf
                        </span>
                        <span className="text-xs font-bold text-[var(--brand)]">{intent.count}×</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[#f0ddd4]">
                      <div
                        className="h-1.5 rounded-full"
                        style={{ width: `${(intent.count / intentMax) * 100}%`, backgroundColor: 'var(--brand)', minWidth: '4px' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="surface-card p-5 lg:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffe6d8]">
                <Users className="h-4 w-4 text-[var(--brand)]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent sessions</h3>
                <p className="text-[11px] text-[#9e7f6f]">Latest 5 conversations</p>
              </div>
            </div>
            {botData.recentActivity.length === 0 ? (
              <div className="flex h-24 items-center justify-center text-sm text-[#9e7f6f]">No sessions yet</div>
            ) : (
              <div className="space-y-2.5">
                {botData.recentActivity.map((s) => {
                  const isAnon = s.userId.startsWith('anon_');
                  const shortId = s.userId.replace(/^anon_/, '').slice(0, 8);
                  const statusColor: Record<string, string> = {
                    completed: 'text-[var(--accent)]',
                    active: 'text-[var(--brand)]',
                    expired: 'text-amber-500',
                    error: 'text-red-500',
                  };
                  const statusIcon: Record<string, React.ElementType> = {
                    completed: CheckCircle2,
                    active: Activity,
                    expired: Hourglass,
                    error: XCircle,
                  };
                  const Icon = statusIcon[s.status] ?? Activity;
                  return (
                    <div
                      key={s.sessionId}
                      className="flex items-center justify-between rounded-lg border border-[#f0ddd4] bg-white px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-slate-800">
                          {isAnon ? `Anonymous ·${shortId}` : s.userId.slice(0, 16)}
                        </p>
                        <p className="text-[10px] text-[#9e7f6f]">
                          {s.messageCount} msg · {new Date(s.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <div className={`flex items-center gap-1 text-[11px] font-semibold ${statusColor[s.status] ?? 'text-slate-500'}`}>
                        <Icon className="h-3.5 w-3.5" />
                        <span className="capitalize">{s.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Row 2 — user engagement */}
        <div className="surface-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffe6d8]">
              <Users className="h-4 w-4 text-[var(--brand)]" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">User engagement</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{botData.totalSessions.toLocaleString()}</p>
              <p className="mt-0.5 text-[11px] text-[#9e7f6f]">Total sessions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{botData.uniqueUsers.toLocaleString()}</p>
              <p className="mt-0.5 text-[11px] text-[#9e7f6f]">Unique users</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--brand)]">{botData.returningUsers.toLocaleString()}</p>
              <p className="mt-0.5 text-[11px] text-[#9e7f6f]">Returning users</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">
                {botData.uniqueUsers > 0 ? (botData.totalSessions / botData.uniqueUsers).toFixed(1) : '—'}
              </p>
              <p className="mt-0.5 text-[11px] text-[#9e7f6f]">Sessions per user</p>
            </div>
          </div>
        </div>
      </>
    );
  };

  // ── Tab 3: Paths ─────────────────────────────────────────────────────────────

  const renderPathsTab = () => {
    if (!selectedBotId) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ffe6d8]">
            <GitFork className="h-7 w-7 text-[var(--brand)]" />
          </div>
          <p className="text-base font-semibold text-slate-800">Select a bot to see user path analysis</p>
          <p className="mt-1.5 text-sm text-[#9e7f6f]">Use the bot selector in the top-right corner</p>
        </div>
      );
    }

    if (botLoading) {
      return <div className="h-64 animate-pulse rounded-2xl bg-[#f0ddd4]" />;
    }

    return (
      <div className="surface-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffe6d8]">
            <GitFork className="h-4 w-4 text-[var(--brand)]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">User path analysis</h3>
            <p className="text-[11px] text-[#9e7f6f]">
              Most common flow traversals · left → right · thickness = frequency
            </p>
          </div>
        </div>
        {pathData ? (
          <PathGraph nodes={pathData.nodes} edges={pathData.edges} totalSessions={pathData.totalSessions} />
        ) : (
          <div className="flex h-24 animate-pulse items-center justify-center text-sm text-[#9e7f6f]">
            Loading path data…
          </div>
        )}
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="py-6 md:py-8">
      {/* Header */}
      <div className="mb-7 flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle mt-1">Real conversations across all bots — simulator sessions excluded</p>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          {/* Export + Refresh — visible when a bot is selected */}
          {selectedBotId && (
            <>
              <button
                onClick={async () => {
                  if (!botData) return;
                  setExporting(true);
                  try {
                    await exportBotAnalytics(selectedBotName, botData, pathData);
                  } catch {
                    // ignore export errors
                  } finally {
                    setExporting(false);
                  }
                }}
                disabled={exporting || !botData}
                className="flex items-center gap-1.5 rounded-xl border border-[#e4cfc4] bg-white px-3 py-2 text-xs font-semibold text-[#9e7f6f] transition hover:bg-[#fff0e4] disabled:opacity-50"
              >
                <Download className={`h-3.5 w-3.5 ${exporting ? 'animate-pulse' : ''}`} />
                {exporting ? 'Exporting…' : 'Export'}
              </button>
              <button
                onClick={() => loadBotData(true)}
                className="flex items-center gap-1.5 rounded-xl border border-[#e4cfc4] bg-white px-3 py-2 text-xs font-semibold text-[#9e7f6f] transition hover:bg-[#fff0e4]"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </>
          )}

          {/* Bot selector */}
          <div className="relative" ref={selectorRef}>
            <button
              onClick={() => setSelectorOpen((v) => !v)}
              className="flex items-center gap-2 rounded-xl border border-[#e4cfc4] bg-[#fff8f4] px-3.5 py-2 text-sm font-semibold text-slate-800 transition hover:bg-[#fff0e4]"
            >
              <Bot className="h-4 w-4 text-[var(--brand)]" />
              <span className="max-w-[140px] truncate">{selectedBotId ? selectedBotName : 'All bots'}</span>
              <ChevronDown className={`h-3.5 w-3.5 text-[#9e7f6f] transition-transform ${selectorOpen ? 'rotate-180' : ''}`} />
            </button>

            {selectorOpen && (
              <div className="absolute right-0 top-full z-20 mt-1.5 w-64 overflow-hidden rounded-2xl border border-[#e4cfc4] bg-white shadow-xl">
                <button
                  onClick={() => { setSelectedBotId(null); setSelectorOpen(false); }}
                  className={`flex w-full items-center justify-between px-4 py-3 text-sm transition hover:bg-[#fff0e4] ${!selectedBotId ? 'bg-[#fff0e4] font-bold text-[var(--brand)]' : 'text-slate-700'}`}
                >
                  <span>All bots</span>
                  <span className="text-xs text-[#9e7f6f]">global view</span>
                </button>
                {overview?.bots.map((bot) => (
                  <button
                    key={bot._id}
                    onClick={() => { setSelectedBotId(bot._id); setSelectorOpen(false); }}
                    className={`flex w-full items-center justify-between px-4 py-3 text-sm transition hover:bg-[#fff0e4] ${bot._id === selectedBotId ? 'bg-[#fff0e4] font-bold text-[var(--brand)]' : 'text-slate-800'}`}
                  >
                    <span>{bot.name}</span>
                    <span className="text-xs text-[#9e7f6f]">{bot.sessions} sessions</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="mb-6 flex gap-1 rounded-2xl border border-[#e4cfc4] bg-[#fff8f4] p-1">
        {(['sessions', 'engagement', 'paths'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
              activeTab === tab
                ? 'bg-white text-[var(--brand)] shadow-sm'
                : 'text-[#9e7f6f] hover:bg-white/60 hover:text-slate-800'
            }`}
          >
            {tab === 'sessions' ? 'Sessions' : tab === 'engagement' ? 'Engagement' : 'User Paths'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'sessions' && renderSessionsTab()}
      {activeTab === 'engagement' && renderEngagementTab()}
      {activeTab === 'paths' && renderPathsTab()}
    </div>
  );
}

