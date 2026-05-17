import { useEffect, useState, useRef } from 'react';
import { MessageSquare, Bot, User, Clock, ChevronDown, Search, Inbox, Loader2, Tag } from 'lucide-react';
import { useBotStore } from '../stores/useBotStore';
import { botsService } from '../services/bots.service';
import type { ConversationSessionSummary, ConversationSession } from '../services/bots.service';

const STATUS_STYLES: Record<string, string> = {
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  active: 'bg-blue-50 text-blue-700 border-blue-200',
  expired: 'bg-slate-100 text-slate-500 border-slate-200',
  error: 'bg-red-50 text-red-600 border-red-200',
};

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDuration(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  return `${Math.round(ms / 60000)}m`;
}

export default function ConversationsPage() {
  const { bots, fetchBots } = useBotStore();
  const [selectedBotId, setSelectedBotId] = useState<string>('');
  const [sessions, setSessions] = useState<ConversationSessionSummary[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<ConversationSessionSummary[]>([]);
  const [selectedSession, setSelectedSession] = useState<ConversationSession | null>(null);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);
  const [search, setSearch] = useState('');
  const [botDropdownOpen, setBotDropdownOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchBots(); }, []);

  useEffect(() => {
    if (!selectedBotId) return;
    setLoadingSessions(true);
    setSelectedSession(null);
    setSessions([]);
    botsService.getSessions(selectedBotId)
      .then((data) => { setSessions(data); setFilteredSessions(data); })
      .finally(() => setLoadingSessions(false));
  }, [selectedBotId]);

  useEffect(() => {
    const q = search.toLowerCase();
    if (!q) { setFilteredSessions(sessions); return; }
    setFilteredSessions(
      sessions.filter((s) =>
        s.userId.toLowerCase().includes(q) ||
        s.status.includes(q) ||
        s.history.some((t) => t.content.toLowerCase().includes(q)),
      ),
    );
  }, [search, sessions]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedSession]);

  const handleSelectSession = async (session: ConversationSessionSummary) => {
    if (!selectedBotId) return;
    setLoadingSession(true);
    try {
      const full = await botsService.getSession(selectedBotId, session._id);
      setSelectedSession(full);
    } finally {
      setLoadingSession(false);
    }
  };

  const selectedBot = bots.find((b) => b._id === selectedBotId);

  return (
    <div className="-mx-2 flex h-[calc(100vh-2.5rem)] gap-3 md:-mx-4 md:h-[calc(100vh-4.5rem)]">
      {/* ── Left panel ─────────────────────────────────────────────── */}
      <div className="surface-panel flex min-h-0 w-full flex-shrink-0 flex-col overflow-hidden md:w-80">
        {/* Bot selector */}
        <div className="border-b border-[#efd6ca] p-4">
          <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-widest text-[#9e7f6f]">
            Bot
          </p>
          <div className="relative">
            <button
              onClick={() => setBotDropdownOpen((v) => !v)}
              className="flex w-full items-center justify-between gap-2 rounded-xl border border-[#dfc4b5] bg-[#fff8f2] px-3 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-[var(--brand-strong)] focus:outline-none"
            >
              <span className="flex items-center gap-2 truncate">
                <Bot className="h-4 w-4 flex-shrink-0 text-[var(--brand)]" />
                {selectedBot ? selectedBot.name : 'Select a bot…'}
              </span>
              <ChevronDown className={`h-4 w-4 flex-shrink-0 text-[#9e7f6f] transition-transform ${botDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {botDropdownOpen && (
              <div className="absolute left-0 top-full z-20 mt-1 w-full rounded-xl border border-[#dfc4b5] bg-white shadow-lg overflow-hidden">
                {bots.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-[#9e7f6f]">No bots yet</div>
                ) : (
                  bots.map((bot) => (
                    <button
                      key={bot._id}
                      onClick={() => { setSelectedBotId(bot._id); setBotDropdownOpen(false); }}
                      className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[#fff1e9] ${selectedBotId === bot._id ? 'bg-[#fff0e4] text-[var(--brand-strong)]' : 'text-slate-700'}`}
                    >
                      <Bot className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{bot.name}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        {selectedBotId && (
          <div className="border-b border-[#efd6ca] px-4 py-3">
            <div className="flex items-center gap-2 rounded-xl border border-[#dfc4b5] bg-[#fff8f2] px-3 py-2">
              <Search className="h-3.5 w-3.5 flex-shrink-0 text-[#9e7f6f]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations…"
                className="w-full bg-transparent text-sm text-slate-800 placeholder-[#b8917f] focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Session list */}
        <div className="flex-1 overflow-y-auto">
          {!selectedBotId && (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-[#9e7f6f]">
              <Bot className="h-8 w-8 opacity-40" />
              <p className="text-sm font-medium">Select a bot to view conversations</p>
            </div>
          )}

          {selectedBotId && loadingSessions && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-5 w-5 animate-spin text-[var(--brand)]" />
            </div>
          )}

          {selectedBotId && !loadingSessions && filteredSessions.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-[#9e7f6f]">
              <Inbox className="h-8 w-8 opacity-40" />
              <p className="text-sm font-medium">No conversations yet</p>
            </div>
          )}

          {filteredSessions.map((session) => {
            const preview = session.history.slice(-1)[0];
            const isSelected = selectedSession?._id === session._id;
            return (
              <button
                key={session._id}
                onClick={() => handleSelectSession(session)}
                className={`w-full border-b border-[#f5e4d9] p-4 text-left transition-colors hover:bg-[#fff4ee] ${isSelected ? 'bg-[#fff0e4]' : ''}`}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 truncate">
                    <User className="h-3 w-3 flex-shrink-0 text-[#b8917f]" />
                    {session.userId.startsWith('anon_') ? 'Anonymous' : session.userId.slice(0, 16)}
                  </span>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide ${STATUS_STYLES[session.status] ?? STATUS_STYLES.expired}`}>
                    {session.status}
                  </span>
                </div>
                {preview && (
                  <p className="mb-1.5 line-clamp-2 text-xs text-[#6b5147]">
                    <span className={`mr-1 font-semibold ${preview.role === 'bot' ? 'text-[var(--brand)]' : 'text-slate-500'}`}>
                      {preview.role === 'bot' ? 'Bot:' : 'User:'}
                    </span>
                    {preview.content}
                  </p>
                )}
                <div className="flex items-center gap-2 text-[0.65rem] text-[#a08070]">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(session.createdAt)}</span>
                  <span>·</span>
                  <span>{session.history.length} msgs</span>
                  {session.triggeredIntents.length > 0 && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Tag className="h-2.5 w-2.5" />
                        {session.triggeredIntents.length} intent{session.triggeredIntents.length > 1 ? 's' : ''}
                      </span>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Right panel: chat view ──────────────────────────────────── */}
      <div className="surface-panel flex min-h-0 flex-1 flex-col overflow-hidden">
        {!selectedSession && !loadingSession && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-[#9e7f6f]">
            <MessageSquare className="h-10 w-10 opacity-30" />
            <p className="text-sm font-medium">
              {selectedBotId ? 'Select a conversation to inspect' : 'Pick a bot and a conversation'}
            </p>
          </div>
        )}

        {loadingSession && (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--brand)]" />
          </div>
        )}

        {selectedSession && !loadingSession && (
          <>
            {/* Header */}
            <div className="flex-shrink-0 border-b border-[#efd6ca] px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand)] text-white shadow">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {selectedSession.userId.startsWith('anon_') ? 'Anonymous User' : selectedSession.userId}
                      </p>
                      <p className="text-xs text-[#9e7f6f]">
                        {formatDate(selectedSession.createdAt)} · {formatTime(selectedSession.createdAt)}
                        {' '}—{' '}
                        {formatDuration(selectedSession.createdAt, selectedSession.lastActivityAt)} duration
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${STATUS_STYLES[selectedSession.status] ?? STATUS_STYLES.expired}`}>
                    {selectedSession.status}
                  </span>
                  <span className="rounded-full border border-[#dfc4b5] bg-[#fff8f2] px-2.5 py-0.5 text-xs font-semibold text-[#7a5c4e]">
                    {selectedSession.history.length} messages
                  </span>
                  {selectedSession.triggeredIntents.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selectedSession.triggeredIntents.slice(0, 4).map((ti, i) => (
                        <span key={i} className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-amber-700">
                          {ti.intent}
                        </span>
                      ))}
                      {selectedSession.triggeredIntents.length > 4 && (
                        <span className="rounded-full border border-[#dfc4b5] bg-[#fff8f2] px-2 py-0.5 text-[0.6rem] text-[#9e7f6f]">
                          +{selectedSession.triggeredIntents.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3">
              {selectedSession.history.length === 0 && (
                <p className="text-center text-sm text-[#9e7f6f]">No messages in this session.</p>
              )}
              {selectedSession.history.map((turn, idx) => (
                <div key={idx} className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {turn.role === 'bot' && (
                    <div className="mr-2 mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[var(--brand)] shadow-sm">
                      <Bot className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                  <div className="max-w-[72%]">
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                        turn.role === 'user'
                          ? 'rounded-tr-sm bg-[var(--brand)] text-white'
                          : 'rounded-tl-sm border border-[#ead5c8] bg-white text-slate-800'
                      }`}
                    >
                      {turn.content}
                    </div>
                    <p className={`mt-1 text-[0.6rem] text-[#b8917f] ${turn.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {formatTime(turn.timestamp)}
                    </p>
                  </div>
                  {turn.role === 'user' && (
                    <div className="ml-2 mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#f5e2d3] shadow-sm">
                      <User className="h-3.5 w-3.5 text-[#9e5f3c]" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
