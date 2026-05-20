import { useEffect, useState } from 'react';
import {
  Activity,
  BarChart2,
  Brain,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  MessageCircle,
  RefreshCw,
  Users,
  XCircle,
  Hourglass,
  TrendingUp,
  GitFork,
} from 'lucide-react';
import ExcelJS from 'exceljs';
import { botsService } from '../../services/bots.service';
import PathGraph from './PathGraph';

type PathData = Awaited<ReturnType<typeof botsService.getPathAnalysis>>;

type DetailedUsage = Awaited<ReturnType<typeof botsService.getDetailedUsage>>;

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

function MiniStatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-[#e4cfc4] bg-white p-4">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffe6d8]">
        <Icon className="h-4 w-4 text-[var(--brand)]" />
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9e7f6f]">{label}</p>
      <p className={`mt-0.5 text-2xl font-bold ${accent ?? 'text-slate-900'}`}>{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-[#9e7f6f]">{sub}</p>}
    </div>
  );
}

function StatusBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
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

// ── Excel export ─────────────────────────────────────────────────────────────

const BRAND = 'D35A2F'; // brand orange (no #)
const HEADER_BG = 'FFF0E4';

function styleHeader(ws: ExcelJS.Worksheet, row: number, cols: number) {
  const r = ws.getRow(row);
  for (let c = 1; c <= cols; c++) {
    const cell = r.getCell(c);
    cell.font = { bold: true, color: { argb: `FF${BRAND}` } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${HEADER_BG}` } };
    cell.border = {
      bottom: { style: 'thin', color: { argb: `FF${BRAND}` } },
    };
  }
}

async function exportBotAnalytics(
  botName: string,
  data: DetailedUsage,
  pathData: PathData | null,
) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'MBRF NLP Flow Builder';
  wb.created = new Date();

  // ── Sheet 1: Summary ──────────────────────────────────────────────────────
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
    { metric: 'Sessions per user', value: data.uniqueUsers > 0 ? +(data.totalSessions / data.uniqueUsers).toFixed(2) : 0 },
    { metric: 'Avg messages / session', value: data.avgMessagesPerSession },
    { metric: 'Max messages in one session', value: data.maxMessagesInSession },
    { metric: 'Avg session duration (seconds)', value: data.avgSessionDurationSec },
    { metric: 'Completion rate (%)', value: data.completionRate },
  ]);

  // ── Sheet 2: Session status breakdown ────────────────────────────────────
  const status = wb.addWorksheet('Status Breakdown');
  status.columns = [
    { header: 'Status', key: 'status', width: 18 },
    { header: 'Count', key: 'count', width: 12 },
    { header: '% of total', key: 'pct', width: 14 },
  ];
  styleHeader(status, 1, 3);
  const total = data.statusBreakdown.active + data.statusBreakdown.completed + data.statusBreakdown.expired + data.statusBreakdown.error;
  const statusRows = [
    { status: 'Completed', count: data.statusBreakdown.completed },
    { status: 'Active', count: data.statusBreakdown.active },
    { status: 'Expired', count: data.statusBreakdown.expired },
    { status: 'Error', count: data.statusBreakdown.error },
  ];
  for (const r of statusRows) {
    status.addRow({ ...r, pct: total > 0 ? +((r.count / total) * 100).toFixed(1) : 0 });
  }

  // ── Sheet 3: Monthly trend ────────────────────────────────────────────────
  const monthly = wb.addWorksheet('Monthly Trend');
  monthly.columns = [
    { header: 'Month', key: 'label', width: 14 },
    { header: 'Sessions', key: 'sessions', width: 12 },
    { header: 'Messages', key: 'messages', width: 12 },
  ];
  styleHeader(monthly, 1, 3);
  monthly.addRows(data.chart);

  // ── Sheet 4: Hourly distribution ─────────────────────────────────────────
  const hourly = wb.addWorksheet('Hourly Distribution');
  hourly.columns = [
    { header: 'Hour', key: 'hour', width: 10 },
    { header: 'Label', key: 'label', width: 12 },
    { header: 'Sessions', key: 'count', width: 12 },
  ];
  styleHeader(hourly, 1, 3);
  hourly.addRows(
    data.hourly.map((h) => ({
      hour: h.hour,
      label: formatHour(h.hour),
      count: h.count,
    })),
  );

  // ── Sheet 5: Day of week ──────────────────────────────────────────────────
  const dow = wb.addWorksheet('Day of Week');
  dow.columns = [
    { header: 'Day', key: 'day', width: 14 },
    { header: 'Sessions', key: 'count', width: 12 },
  ];
  styleHeader(dow, 1, 2);
  const DOW_ORDER = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const sortedDow = [...data.dow].sort((a, b) => DOW_ORDER.indexOf(a.day) - DOW_ORDER.indexOf(b.day));
  dow.addRows(sortedDow);

  // ── Sheet 6: Top intents ──────────────────────────────────────────────────
  const intents = wb.addWorksheet('Top Intents');
  intents.columns = [
    { header: 'Rank', key: 'rank', width: 8 },
    { header: 'Intent', key: 'intent', width: 30 },
    { header: 'Triggers', key: 'count', width: 12 },
    { header: 'Avg confidence (%)', key: 'avgConf', width: 20 },
  ];
  styleHeader(intents, 1, 4);
  intents.addRows(
    data.topIntents.map((t, i) => ({
      rank: i + 1,
      intent: t.intent,
      count: t.count,
      avgConf: +((t.avgScore * 100).toFixed(1)),
    })),
  );

  // ── Sheet 7: Recent sessions ──────────────────────────────────────────────
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

  // ── Sheet 8: Path analysis (nodes) ───────────────────────────────────────
  if (pathData) {
    const nodes = wb.addWorksheet('Path - Nodes');
    nodes.columns = [
      { header: 'Node ID', key: 'id', width: 28 },
      { header: 'Label', key: 'label', width: 28 },
      { header: 'Type', key: 'type', width: 16 },
      { header: 'Visit count', key: 'visitCount', width: 14 },
    ];
    styleHeader(nodes, 1, 4);
    nodes.addRows(
      [...pathData.nodes].sort((a, b) => b.visitCount - a.visitCount),
    );

    const edges = wb.addWorksheet('Path - Edges');
    edges.columns = [
      { header: 'From node', key: 'from', width: 28 },
      { header: 'To node', key: 'to', width: 28 },
      { header: 'Traversal count', key: 'count', width: 18 },
    ];
    styleHeader(edges, 1, 3);
    edges.addRows(
      [...pathData.edges].sort((a, b) => b.count - a.count),
    );
  }

  // ── Write & download ─────────────────────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const slug = botName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  a.download = `${slug}-analytics-${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  botId: string;
  botName: string;
}

export default function BotDetailUsage({ botId, botName }: Props) {
  const [data, setData] = useState<DetailedUsage | null>(null);
  const [pathData, setPathData] = useState<PathData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);

  const load = (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    Promise.all([
      botsService.getDetailedUsage(botId),
      botsService.getPathAnalysis(botId),
    ])
      .then(([detail, path]) => {
        setData(detail);
        setPathData(path);
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [botId]);

  if (loading) {
    return (
      <div className="mt-8 animate-pulse space-y-4">
        <div className="h-6 w-48 rounded bg-[#f0ddd4]" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-[#f0ddd4]" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="h-52 rounded-2xl bg-[#f0ddd4]" />
          <div className="h-52 rounded-2xl bg-[#f0ddd4]" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const hourMax = Math.max(...data.hourly.map((h) => h.count), 1);
  const dowMax = Math.max(...data.dow.map((d) => d.count), 1);
  const chartMax = Math.max(...data.chart.map((c) => c.sessions), 1);
  const intentMax = data.topIntents.length > 0 ? data.topIntents[0].count : 1;
  const totalStatusSessions = data.statusBreakdown.active + data.statusBreakdown.completed + data.statusBreakdown.expired + data.statusBreakdown.error;

  const peakHour = data.hourly.reduce((best, h) => (h.count > best.count ? h : best), data.hourly[0]);
  const peakDay = data.dow.reduce((best, d) => (d.count > best.count ? d : best), data.dow[0]);

  return (
    <div className="mt-10">
      {/* Section header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ffe6d8]">
            <Activity className="h-5 w-5 text-[var(--brand)]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{botName}</h2>
            <p className="text-xs text-[#9e7f6f]">Detailed analytics — real conversations only</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              if (!data) return;
              setExporting(true);
              try {
                await exportBotAnalytics(botName, data, pathData);
              } catch {
                // silently ignore export errors
              } finally {
                setExporting(false);
              }
            }}
            disabled={exporting}
            className="flex items-center gap-1.5 rounded-xl border border-[#e4cfc4] bg-white px-3 py-2 text-xs font-semibold text-[#9e7f6f] transition hover:bg-[#fff0e4] disabled:opacity-50"
          >
            <Download className={`h-3.5 w-3.5 ${exporting ? 'animate-pulse' : ''}`} />
            {exporting ? 'Exporting…' : 'Export'}
          </button>
          <button
            onClick={() => load(true)}
            className="flex items-center gap-1.5 rounded-xl border border-[#e4cfc4] bg-white px-3 py-2 text-xs font-semibold text-[#9e7f6f] transition hover:bg-[#fff0e4]"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Key metrics row */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStatCard
          icon={MessageCircle}
          label="Avg msg / session"
          value={data.avgMessagesPerSession.toString()}
          sub={`max ${data.maxMessagesInSession} in one session`}
        />
        <MiniStatCard
          icon={Clock}
          label="Avg duration"
          value={formatDuration(data.avgSessionDurationSec)}
          sub="completed + expired sessions"
        />
        <MiniStatCard
          icon={CheckCircle2}
          label="Completion rate"
          value={`${data.completionRate}%`}
          accent={data.completionRate >= 60 ? 'text-[var(--accent)]' : 'text-slate-900'}
          sub={`${data.statusBreakdown.completed} completed`}
        />
        <MiniStatCard
          icon={RefreshCw}
          label="Returning users"
          value={data.returningUsers.toString()}
          sub={`of ${data.uniqueUsers} unique`}
        />
      </div>

      {/* Row 2: Status breakdown + Monthly trend */}
      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Status breakdown */}
        <div className="surface-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffe6d8]">
              <Activity className="h-4 w-4 text-[var(--brand)]" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Session status</h3>
          </div>
          <div className="space-y-3">
            <StatusBar label="Completed" count={data.statusBreakdown.completed} total={totalStatusSessions} color="var(--accent)" />
            <StatusBar label="Active" count={data.statusBreakdown.active} total={totalStatusSessions} color="var(--brand)" />
            <StatusBar label="Expired" count={data.statusBreakdown.expired} total={totalStatusSessions} color="#f59e0b" />
            <StatusBar label="Error" count={data.statusBreakdown.error} total={totalStatusSessions} color="#ef4444" />
          </div>
        </div>

        {/* Monthly trend */}
        <div className="surface-card p-5 lg:col-span-3">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffe6d8]">
              <TrendingUp className="h-4 w-4 text-[var(--brand)]" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Sessions by month</h3>
          </div>
          <div className="flex items-end gap-2 h-28">
            {data.chart.map((c) => (
              <div key={c.label} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[9px] font-semibold text-slate-700">
                  {c.sessions > 0 ? c.sessions : ''}
                </span>
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

      {/* Row 3: Hourly + Day of week */}
      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Peak hours */}
        <div className="surface-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffe6d8]">
                <Clock className="h-4 w-4 text-[var(--brand)]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Peak hours</h3>
            </div>
            {peakHour.count > 0 && (
              <span className="rounded-full bg-[#ffe6d8] px-2.5 py-0.5 text-xs font-semibold text-[var(--brand)]">
                Peak: {formatHour(peakHour.hour)}
              </span>
            )}
          </div>
          <div className="flex items-end gap-px h-20 overflow-hidden">
            {data.hourly.map((h) => (
              <div
                key={h.hour}
                className="group relative flex flex-1 flex-col items-center"
                title={`${formatHour(h.hour)}: ${h.count} sessions`}
              >
                <div
                  className="w-full rounded-sm transition-all"
                  style={{
                    height: `${Math.max((h.count / hourMax) * 64, h.count > 0 ? 3 : 0)}px`,
                    backgroundColor:
                      h.hour === peakHour.hour && h.count > 0
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

        {/* Day of week */}
        <div className="surface-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffe6d8]">
                <BarChart2 className="h-4 w-4 text-[var(--brand)]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Busiest days</h3>
            </div>
            {peakDay.count > 0 && (
              <span className="rounded-full bg-[#ffe6d8] px-2.5 py-0.5 text-xs font-semibold text-[var(--brand)]">
                Peak: {DOW_FULL[data.dow.indexOf(peakDay)]}
              </span>
            )}
          </div>
          <div className="flex items-end gap-2 h-20">
            {data.dow.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[9px] font-semibold text-slate-700">
                  {d.count > 0 ? d.count : ''}
                </span>
                <div
                  className="w-full rounded-t-sm transition-all"
                  style={{
                    height: `${Math.max((d.count / dowMax) * 52, d.count > 0 ? 3 : 0)}px`,
                    backgroundColor:
                      d === peakDay && d.count > 0
                        ? 'var(--brand)'
                        : d.count > 0
                        ? 'rgba(239,108,62,0.45)'
                        : '#f0ddd4',
                  }}
                />
                <span className="text-[9px] text-[#9e7f6f]">{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Top intents + Recent activity */}
      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Top intents */}
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
          {data.topIntents.length === 0 ? (
            <div className="flex h-24 items-center justify-center text-sm text-[#9e7f6f]">
              No intent data yet — intents are tracked as users interact
            </div>
          ) : (
            <div className="space-y-3">
              {data.topIntents.map((intent, idx) => (
                <div key={intent.intent}>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#ffe6d8] text-[10px] font-bold text-[var(--brand)]">
                        {idx + 1}
                      </span>
                      <span className="truncate text-sm font-semibold text-slate-800">
                        {intent.intent}
                      </span>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
                      <span className="rounded-full bg-[#f0f9f8] px-2 py-0.5 text-[11px] font-semibold text-[var(--accent)]">
                        {(intent.avgScore * 100).toFixed(0)}% conf
                      </span>
                      <span className="text-xs font-bold text-[var(--brand)]">
                        {intent.count}×
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#f0ddd4]">
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${(intent.count / intentMax) * 100}%`,
                        backgroundColor: 'var(--brand)',
                        minWidth: '4px',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent sessions */}
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
          {data.recentActivity.length === 0 ? (
            <div className="flex h-24 items-center justify-center text-sm text-[#9e7f6f]">
              No sessions yet
            </div>
          ) : (
            <div className="space-y-2.5">
              {data.recentActivity.map((s) => {
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

      {/* Users summary */}
      <div className="surface-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffe6d8]">
            <Users className="h-4 w-4 text-[var(--brand)]" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">User engagement</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{data.totalSessions.toLocaleString()}</p>
            <p className="mt-0.5 text-[11px] text-[#9e7f6f]">Total sessions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{data.uniqueUsers.toLocaleString()}</p>
            <p className="mt-0.5 text-[11px] text-[#9e7f6f]">Unique users</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[var(--brand)]">{data.returningUsers.toLocaleString()}</p>
            <p className="mt-0.5 text-[11px] text-[#9e7f6f]">Returning users</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">
              {data.uniqueUsers > 0
                ? (data.totalSessions / data.uniqueUsers).toFixed(1)
                : '—'}
            </p>
            <p className="mt-0.5 text-[11px] text-[#9e7f6f]">Sessions per user</p>
          </div>
        </div>
      </div>

      {/* Path analysis graph */}
      <div className="surface-card mt-5 p-5">
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
          <PathGraph
            nodes={pathData.nodes}
            edges={pathData.edges}
            totalSessions={pathData.totalSessions}
          />
        ) : (
          <div className="flex h-24 items-center justify-center animate-pulse text-sm text-[#9e7f6f]">
            Loading path data…
          </div>
        )}
      </div>
    </div>
  );
}

// ── Bot selector pill ─────────────────────────────────────────────────────────

interface BotSelectorProps {
  bots: { _id: string; name: string; sessions: number }[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function BotSelector({ bots, selectedId, onSelect }: BotSelectorProps) {
  const [open, setOpen] = useState(false);
  const selected = bots.find((b) => b._id === selectedId);

  return (
    <div className="relative mt-8">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ffe6d8]">
          <Activity className="h-[18px] w-[18px] text-[var(--brand)]" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">Bot deep-dive</h2>
          <p className="text-xs text-[#9e7f6f]">Select a bot to see detailed analytics</p>
        </div>
      </div>

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-2xl border border-[#e4cfc4] bg-[#fff8f4] px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-[#fff0e4] sm:w-72"
      >
        <span>{selected ? selected.name : 'Choose a bot…'}</span>
        <ChevronDown className={`h-4 w-4 text-[#9e7f6f] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-2xl border border-[#e4cfc4] bg-white shadow-lg sm:w-72">
          {bots.map((bot) => (
            <button
              key={bot._id}
              onClick={() => {
                onSelect(bot._id);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between px-4 py-3 text-sm transition hover:bg-[#fff0e4] ${
                bot._id === selectedId ? 'bg-[#fff0e4] font-bold text-[var(--brand)]' : 'text-slate-800'
              }`}
            >
              <span>{bot.name}</span>
              <span className="text-xs text-[#9e7f6f]">{bot.sessions} sessions</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
