import { useState, useEffect, useRef, type ReactNode } from 'react';
import {
  Workflow,
  BrainCircuit,
  LayoutDashboard,
  FlaskConical,
  Users,
  BarChart2,
  ArrowRight,
  Plus,
  Zap,
} from 'lucide-react';

// ── Mock UIs ──────────────────────────────────────────────────────────────────

function FlowBuilderMock() {
  return (
    <div
      className="w-full h-full rounded-2xl bg-white border border-[#ebd6cc] overflow-hidden flex flex-col"
      style={{ boxShadow: '0 32px 64px -24px rgba(101,60,32,0.18)' }}
    >
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#ebd6cc] bg-[#fff7f2]">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-[#ef6c3e]/40" />
          <div className="h-3 w-3 rounded-full bg-[#ebd6cc]" />
          <div className="h-3 w-3 rounded-full bg-[#ebd6cc]" />
        </div>
        <span className="text-xs font-semibold text-[#75636f]">Welcome Flow</span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="h-5 w-5 rounded bg-[#ffe6d8] flex items-center justify-center">
            <Workflow className="h-3 w-3 text-[#ef6c3e]" />
          </div>
          <span className="text-[10px] font-medium text-[#75636f]">4 nodes</span>
        </div>
      </div>

      <div
        className="flex-1 relative bg-[#fdfaf8]"
        style={{
          backgroundImage: 'radial-gradient(circle, #ebd6cc 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 500 320"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Connector 1: User Message → Detect Intent */}
          <line x1="250" y1="74" x2="250" y2="102" stroke="#ebd6cc" strokeWidth="2" />
          <polygon points="247,99 250,106 253,99" fill="#ebd6cc" />

          {/* Connector 2: Detect Intent → Route Intent */}
          <line x1="250" y1="146" x2="250" y2="174" stroke="#ebd6cc" strokeWidth="2" />
          <polygon points="247,171 250,178 253,171" fill="#ebd6cc" />

          {/* Connector 3: Route Intent → Send Reply (active, dashed) */}
          <line x1="250" y1="218" x2="250" y2="246" stroke="#ef6c3e" strokeWidth="2" strokeDasharray="5 3" />
          <polygon points="247,243 250,250 253,243" fill="#ef6c3e" />

          {/* Node 1: User Message */}
          <rect x="185" y="30" width="130" height="44" rx="12" fill="#fff7f2" stroke="#ef6c3e" strokeWidth="1.5" />
          <text x="250" y="46" textAnchor="middle" fill="#75636f" fontSize="9" fontWeight="500">TRIGGER</text>
          <text x="250" y="62" textAnchor="middle" fill="#2a2127" fontSize="12" fontWeight="700" fontFamily="Sora,sans-serif">User Message</text>

          {/* Node 2: Detect Intent */}
          <rect x="185" y="102" width="130" height="44" rx="12" fill="#f0faf9" stroke="#0f766e" strokeWidth="1.5" />
          <text x="250" y="118" textAnchor="middle" fill="#75636f" fontSize="9" fontWeight="500">NLP</text>
          <text x="250" y="134" textAnchor="middle" fill="#0f766e" fontSize="12" fontWeight="700" fontFamily="Sora,sans-serif">Detect Intent</text>

          {/* Node 3: Route Intent (selected/active) */}
          <rect x="182" y="171" width="136" height="50" rx="14" fill="none" stroke="#ef6c3e" strokeWidth="3" opacity="0.2" />
          <rect x="185" y="174" width="130" height="44" rx="12" fill="#fff0e4" stroke="#ef6c3e" strokeWidth="2" />
          <text x="250" y="190" textAnchor="middle" fill="#75636f" fontSize="9" fontWeight="500">CONDITION</text>
          <text x="250" y="206" textAnchor="middle" fill="#ef6c3e" fontSize="12" fontWeight="700" fontFamily="Sora,sans-serif">Route Intent</text>

          {/* Node 4: Send Reply */}
          <rect x="185" y="246" width="130" height="44" rx="12" fill="#fff7f2" stroke="#ebd6cc" strokeWidth="1.5" />
          <text x="250" y="262" textAnchor="middle" fill="#75636f" fontSize="9" fontWeight="500">MESSAGE</text>
          <text x="250" y="278" textAnchor="middle" fill="#2a2127" fontSize="12" fontWeight="700" fontFamily="Sora,sans-serif">Send Reply</text>
        </svg>
      </div>
    </div>
  );
}

function NlpMock() {
  const intents = [
    { name: 'book_flight', examples: 12, confidence: 94 },
    { name: 'cancel_order', examples: 8, confidence: 88 },
    { name: 'check_status', examples: 15, confidence: 97 },
  ];
  return (
    <div
      className="w-full h-full rounded-2xl bg-white border border-[#ebd6cc] overflow-hidden flex flex-col"
      style={{ boxShadow: '0 32px 64px -24px rgba(101,60,32,0.18)' }}
    >
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#ebd6cc] bg-[#fff7f2]">
        <BrainCircuit className="h-4 w-4 text-[#ef6c3e]" />
        <span className="text-xs font-semibold text-[#2a2127]">NLP Training</span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-[#0f766e]" />
          <span className="text-[10px] font-medium text-[#0f766e]">Model ready</span>
        </div>
      </div>

      <div className="px-4 pt-4 pb-3 border-b border-[#ebd6cc]">
        <p className="text-[10px] font-semibold text-[#75636f] uppercase tracking-wide mb-2">Test utterance</p>
        <div className="flex items-center gap-2 rounded-xl border border-[#ef6c3e]/40 bg-[#fff7f2] px-3 py-2">
          <span className="text-sm text-[#2a2127]">I want to book a flight to Paris</span>
          <div className="ml-auto flex items-center gap-1.5 shrink-0">
            <span className="rounded-lg bg-[#ffe6d8] px-2 py-0.5 text-[10px] font-bold text-[#ef6c3e]">book_flight</span>
            <span className="text-[10px] font-semibold text-[#0f766e]">94%</span>
          </div>
        </div>
        <div className="mt-2 flex gap-1.5 flex-wrap">
          <span className="rounded-md bg-[#f0faf9] border border-[#0f766e]/25 px-2 py-0.5 text-[10px] font-medium text-[#0f766e]">
            📍 Paris → <strong>destination</strong>
          </span>
          <span className="rounded-md bg-[#ffe6d8] border border-[#ef6c3e]/25 px-2 py-0.5 text-[10px] font-medium text-[#ef6c3e]">
            ✈️ flight → <strong>transport_type</strong>
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 py-3">
        <p className="text-[10px] font-semibold text-[#75636f] uppercase tracking-wide mb-2">Trained Intents</p>
        <div className="space-y-2">
          {intents.map((intent) => (
            <div
              key={intent.name}
              className="flex items-center gap-3 rounded-xl bg-[#fff7f2] border border-[#ebd6cc] px-3 py-2.5"
            >
              <div className="h-7 w-7 rounded-lg bg-[#ffe6d8] flex items-center justify-center shrink-0">
                <BrainCircuit className="h-3.5 w-3.5 text-[#ef6c3e]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#2a2127] font-mono">{intent.name}</p>
                <p className="text-[10px] text-[#75636f]">{intent.examples} examples</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="h-1.5 w-16 rounded-full bg-[#ebd6cc] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#0f766e]"
                    style={{ width: `${intent.confidence}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-[#0f766e]">{intent.confidence}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MultibotMock() {
  const bots = [
    { name: 'Support Bot', color: '#ef6c3e', flows: 12, intents: 34, active: true },
    { name: 'Sales Assistant', color: '#0f766e', flows: 8, intents: 21, active: true },
    { name: 'FAQ Bot', color: '#75636f', flows: 5, intents: 15, active: false },
  ];
  return (
    <div
      className="w-full h-full rounded-2xl bg-white border border-[#ebd6cc] overflow-hidden flex flex-col"
      style={{ boxShadow: '0 32px 64px -24px rgba(101,60,32,0.18)' }}
    >
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#ebd6cc] bg-[#fff7f2]">
        <LayoutDashboard className="h-4 w-4 text-[#ef6c3e]" />
        <span className="text-xs font-semibold text-[#2a2127]">My Bots</span>
        <span className="ml-1 rounded-lg bg-[#ffe6d8] px-2 py-0.5 text-[10px] font-bold text-[#ef6c3e]">3</span>
        <button className="ml-auto flex items-center gap-1.5 rounded-xl bg-[#ef6c3e] px-3 py-1.5 text-[10px] font-semibold text-white">
          <Plus className="h-3 w-3" />
          New Bot
        </button>
      </div>

      <div className="flex-1 px-4 py-4 space-y-3">
        {bots.map((bot) => (
          <div
            key={bot.name}
            className="rounded-xl border border-[#ebd6cc] bg-[#fff7f2] p-4 flex items-center gap-4 hover:border-[#d0baad] transition-colors cursor-pointer"
          >
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center text-white text-base font-bold shrink-0"
              style={{ background: bot.color }}
            >
              {bot.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#2a2127]">{bot.name}</p>
              <p className="text-[10px] text-[#75636f]">{bot.flows} flows · {bot.intents} intents</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="h-2 w-2 rounded-full" style={{ background: bot.active ? '#0f766e' : '#ebd6cc' }} />
              <span className="text-[10px] font-semibold" style={{ color: bot.active ? '#0f766e' : '#75636f' }}>
                {bot.active ? 'Active' : 'Draft'}
              </span>
            </div>
            <ArrowRight className="h-4 w-4 text-[#ebd6cc] shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SimulatorMock() {
  const messages = [
    { from: 'user', text: 'Hi! I need help with my order.' },
    { from: 'bot', text: 'Hello! I can help with that. Could you share your order number?' },
    { from: 'user', text: "It's #A8821" },
    { from: 'bot', text: 'Found it! Order #A8821 is being prepared. Delivery: tomorrow by 6 pm.' },
  ];
  return (
    <div
      className="w-full h-full rounded-2xl bg-white border border-[#ebd6cc] overflow-hidden flex flex-col"
      style={{ boxShadow: '0 32px 64px -24px rgba(101,60,32,0.18)' }}
    >
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#ebd6cc] bg-[#fff7f2]">
        <div className="h-2 w-2 rounded-full bg-[#ef6c3e] animate-pulse" />
        <span className="text-xs font-semibold text-[#2a2127]">Simulator</span>
        <span className="text-[10px] text-[#75636f]">Testing: Support Bot</span>
        <FlaskConical className="ml-auto h-3.5 w-3.5 text-[#75636f]" />
      </div>

      <div className="flex-1 overflow-auto px-4 py-4 space-y-3 bg-[#fdfaf8]">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.from === 'bot' && (
              <div className="h-6 w-6 rounded-full bg-[#ffe6d8] flex items-center justify-center mr-2 mt-0.5 shrink-0">
                <Zap className="h-3 w-3 text-[#ef6c3e]" />
              </div>
            )}
            <div
              className="rounded-2xl px-3 py-2 max-w-[70%] text-xs leading-relaxed"
              style={{
                background: msg.from === 'user' ? '#ef6c3e' : '#ffffff',
                color: msg.from === 'user' ? '#ffffff' : '#2a2127',
                border: msg.from === 'bot' ? '1px solid #ebd6cc' : 'none',
                borderBottomRightRadius: msg.from === 'user' ? 4 : undefined,
                borderBottomLeftRadius: msg.from === 'bot' ? 4 : undefined,
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {/* Typing indicator */}
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-[#ffe6d8] flex items-center justify-center shrink-0">
            <Zap className="h-3 w-3 text-[#ef6c3e]" />
          </div>
          <div className="flex gap-1 bg-white border border-[#ebd6cc] rounded-2xl px-3 py-2.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-[#d0baad]"
                style={{ animation: 'bounce 1.2s ease-in-out infinite', animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-[#ebd6cc]">
        <div className="flex items-center gap-2 rounded-xl border border-[#ebd6cc] bg-[#fff7f2] px-3 py-2">
          <span className="text-xs text-[#75636f]">Type a test message…</span>
          <div className="ml-auto h-6 w-6 rounded-lg bg-[#ef6c3e] flex items-center justify-center">
            <ArrowRight className="h-3 w-3 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamMock() {
  const members = [
    { name: 'Ana Lima', role: 'Owner', initial: 'A', color: '#ef6c3e' },
    { name: 'Carlos M.', role: 'Editor', initial: 'C', color: '#0f766e' },
    { name: 'Priya S.', role: 'Viewer', initial: 'P', color: '#75636f' },
  ];
  const activity = [
    { text: 'Ana updated Welcome Flow', time: '2m' },
    { text: 'Carlos added 3 intents', time: '18m' },
    { text: 'Priya joined the team', time: '5d' },
  ];
  return (
    <div
      className="w-full h-full rounded-2xl bg-white border border-[#ebd6cc] overflow-hidden flex flex-col"
      style={{ boxShadow: '0 32px 64px -24px rgba(101,60,32,0.18)' }}
    >
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#ebd6cc] bg-[#fff7f2]">
        <Users className="h-4 w-4 text-[#ef6c3e]" />
        <span className="text-xs font-semibold text-[#2a2127]">Team</span>
        <span className="ml-1 rounded-lg bg-[#ffe6d8] px-2 py-0.5 text-[10px] font-bold text-[#ef6c3e]">
          3 members
        </span>
        <button className="ml-auto flex items-center gap-1.5 rounded-xl border border-[#ebd6cc] bg-white px-3 py-1.5 text-[10px] font-semibold text-[#75636f]">
          <Plus className="h-3 w-3" /> Invite
        </button>
      </div>

      <div className="flex-1 grid grid-cols-2 divide-x divide-[#ebd6cc]">
        <div className="px-3 py-3 space-y-2">
          <p className="text-[10px] font-semibold text-[#75636f] uppercase tracking-wide mb-2">Members</p>
          {members.map((m) => (
            <div
              key={m.name}
              className="flex items-center gap-2.5 rounded-xl bg-[#fff7f2] px-3 py-2 border border-[#ebd6cc]"
            >
              <div
                className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ background: m.color }}
              >
                {m.initial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#2a2127] truncate">{m.name}</p>
                <p className="text-[10px] text-[#75636f]">{m.role}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="px-3 py-3">
          <p className="text-[10px] font-semibold text-[#75636f] uppercase tracking-wide mb-2">Activity</p>
          <div className="space-y-3">
            {activity.map((a, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#ef6c3e] mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] leading-snug text-[#2a2127]">{a.text}</p>
                  <p className="text-[9px] text-[#75636f]">{a.time} ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsMock() {
  const metrics = [
    { label: 'Avg. handle time', value: '1m 24s', color: '#ef6c3e' },
    { label: 'CSAT score', value: '4.6 / 5', color: '#0f766e' },
    { label: 'Resolution rate', value: '94%', color: '#0f766e' },
  ];
  return (
    <div
      className="w-full h-full rounded-2xl bg-white border border-[#ebd6cc] overflow-hidden flex flex-col"
      style={{ boxShadow: '0 32px 64px -24px rgba(101,60,32,0.18)' }}
    >
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#ebd6cc] bg-[#fff7f2]">
        <BarChart2 className="h-4 w-4 text-[#ef6c3e]" />
        <span className="text-xs font-semibold text-[#2a2127]">Analytics</span>
        <span className="text-[10px] text-[#75636f]">Support Bot</span>
        <div className="ml-auto rounded-lg bg-[#ffe6d8] px-2 py-0.5">
          <span className="text-[10px] font-semibold text-[#ef6c3e]">Last 30 days</span>
        </div>
      </div>

      <div className="flex-1 px-4 pt-3 pb-1 flex flex-col">
        <p className="text-[10px] font-semibold text-[#75636f] uppercase tracking-wide mb-2">Conversation Paths</p>
        <svg viewBox="0 0 460 178" className="w-full flex-1" preserveAspectRatio="xMidYMid meet">
          {/* ── Edges root → intents ── */}
          <path d="M 100 72 C 140 72 140 48 180 48" stroke="#ef6c3e" strokeWidth="3.5" fill="none" opacity="0.55" />
          <path d="M 100 80 C 140 80 140 115 180 115" stroke="#0f766e" strokeWidth="2.2" fill="none" opacity="0.55" />
          <path d="M 100 84 C 140 84 140 156 180 156" stroke="#d0baad" strokeWidth="1.2" fill="none" opacity="0.7" />

          {/* ── Root node ── */}
          <rect x="10" y="54" width="90" height="36" rx="10" fill="#fff7f2" stroke="#ef6c3e" strokeWidth="1.5" />
          <text x="55" y="69" textAnchor="middle" fill="#75636f" fontSize="8.5">START</text>
          <text x="55" y="83" textAnchor="middle" fill="#2a2127" fontSize="11" fontWeight="700">2,847</text>

          {/* ── Intent nodes ── */}
          <rect x="180" y="30" width="104" height="36" rx="10" fill="#fff7f2" stroke="#ef6c3e" strokeWidth="1.5" />
          <text x="232" y="45" textAnchor="middle" fill="#ef6c3e" fontSize="8.5" fontWeight="600">FAQ · 57%</text>
          <text x="232" y="59" textAnchor="middle" fill="#2a2127" fontSize="11" fontWeight="700">1,621</text>

          <rect x="180" y="97" width="104" height="36" rx="10" fill="#f0faf9" stroke="#0f766e" strokeWidth="1.5" />
          <text x="232" y="112" textAnchor="middle" fill="#0f766e" fontSize="8.5" fontWeight="600">Support · 30%</text>
          <text x="232" y="126" textAnchor="middle" fill="#2a2127" fontSize="11" fontWeight="700">854</text>

          <rect x="180" y="141" width="104" height="28" rx="10" fill="#fdfaf8" stroke="#d0baad" strokeWidth="1.2" />
          <text x="232" y="159" textAnchor="middle" fill="#75636f" fontSize="8.5">Other · 372</text>

          {/* ── Edges intents → outcomes ── */}
          <path d="M 284 48 C 324 48 324 40 356 40" stroke="#ef6c3e" strokeWidth="2.2" fill="none" opacity="0.5" />
          <path d="M 284 115 C 324 115 324 106 356 106" stroke="#0f766e" strokeWidth="1.5" fill="none" opacity="0.5" />
          <path d="M 284 115 C 324 115 324 130 356 130" stroke="#d35a2f" strokeWidth="1" fill="none" opacity="0.45" />

          {/* ── Outcome nodes ── */}
          <rect x="356" y="24" width="96" height="30" rx="8" fill="#f0faf9" stroke="#0f766e" strokeWidth="1.5" />
          <text x="404" y="37" textAnchor="middle" fill="#0f766e" fontSize="8" fontWeight="600">✓ Resolved</text>
          <text x="404" y="49" textAnchor="middle" fill="#0f766e" fontSize="9" fontWeight="700">94%</text>

          <rect x="356" y="93" width="96" height="26" rx="8" fill="#f0faf9" stroke="#0f766e" strokeWidth="1.2" />
          <text x="404" y="110" textAnchor="middle" fill="#0f766e" fontSize="8" fontWeight="600">✓ Solved · 71%</text>

          <rect x="356" y="122" width="96" height="26" rx="8" fill="#fff7f2" stroke="#ef6c3e" strokeWidth="1.2" />
          <text x="404" y="139" textAnchor="middle" fill="#ef6c3e" fontSize="8" fontWeight="600">↑ Escalated · 29%</text>
        </svg>
      </div>

      <div className="px-4 py-3 border-t border-[#ebd6cc] grid grid-cols-3 gap-2">
        {metrics.map((m) => (
          <div key={m.label} className="text-center">
            <p className="text-sm font-bold" style={{ color: m.color }}>{m.value}</p>
            <p className="text-[9px] text-[#75636f] leading-tight mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Feature data ──────────────────────────────────────────────────────────────

interface FeatureData {
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  tag?: string;
  mock: ReactNode;
}

const FEATURES: FeatureData[] = [
  {
    icon: <Workflow className="h-5 w-5" />,
    iconBg: '#ffe6d8',
    iconColor: '#ef6c3e',
    title: 'Visual Flow Builder',
    description:
      'Drag-and-drop conversation paths with an intuitive node editor. Connect messages, conditions, and actions without touching code.',
    mock: <FlowBuilderMock />,
  },
  {
    icon: <BrainCircuit className="h-5 w-5" />,
    iconBg: 'rgba(15,118,110,0.1)',
    iconColor: '#0f766e',
    title: 'NLP & Intent Training',
    description:
      'Train custom intents and entities directly inside Zenflow. Powered by industry-leading NLP models, no external tool required.',
    mock: <NlpMock />,
  },
  {
    icon: <LayoutDashboard className="h-5 w-5" />,
    iconBg: '#ffe6d8',
    iconColor: '#ef6c3e',
    title: 'Multi-bot Management',
    description:
      'Manage all your bots from a single workspace. Each bot gets its own flows, NLP model, and analytics — fully organized.',
    mock: <MultibotMock />,
  },
  {
    icon: <FlaskConical className="h-5 w-5" />,
    iconBg: 'rgba(15,118,110,0.1)',
    iconColor: '#0f766e',
    title: 'Real-time Simulator',
    description:
      'Test any conversation path live with the built-in chat simulator. Spot edge cases before your users ever see them.',
    mock: <SimulatorMock />,
  },
  {
    icon: <Users className="h-5 w-5" />,
    iconBg: '#ffe6d8',
    iconColor: '#ef6c3e',
    title: 'Team Collaboration',
    description:
      'Invite teammates, assign roles, and build together in real time. Every change is autosaved and attributed.',
    mock: <TeamMock />,
  },
  {
    icon: <BarChart2 className="h-5 w-5" />,
    iconBg: 'rgba(15,118,110,0.1)',
    iconColor: '#0f766e',
    title: 'Analytics & Insights',
    description:
      'Visualize how users navigate your conversation flows. Track drop-off points, resolution rates, and intent distribution in real time.',
    mock: <AnalyticsMock />,
  },
];

// ── Main component ────────────────────────────────────────────────────────────

export default function Features() {
  const [active, setActive] = useState(0);
  const triggerRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers = triggerRefs.current.map((el, i) => {
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(i);
        },
        { rootMargin: '-40% 0px -40% 0px', threshold: 0 },
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  return (
    <div id="features">
      {/* ── Desktop: sticky scroll ──────────────────────────────────────── */}
      <section
        className="relative desktop-only"
        style={{ height: `${FEATURES.length * 70}vh`, background: '#fff7f2' }}
      >
        {/* Invisible scroll triggers — one per feature */}
        {FEATURES.map((_, i) => (
          <div
            key={i}
            ref={(el) => { triggerRefs.current[i] = el; }}
            style={{
              position: 'absolute',
              top: `${(i / FEATURES.length) * 100}%`,
              height: `${70 / FEATURES.length}vh`,
              width: '1px',
              left: 0,
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* Sticky viewport */}
        <div
          className="grid grid-cols-2 items-center"
          style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflow: 'hidden',
            background: '#fff7f2',
          }}
        >
          {/* Left: feature text */}
          <div className="flex flex-col" style={{ paddingLeft: '4rem', paddingRight: '3rem' }}>
            <p className="section-label mb-5">Features</p>

            {/* Progress pills */}
            <div className="flex items-center gap-2 mb-8">
              {FEATURES.map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: active === i ? 28 : 8,
                    background: active === i ? '#ef6c3e' : '#ebd6cc',
                  }}
                />
              ))}
              <span className="ml-3 text-xs text-[#75636f]">
                <span className="font-bold text-[#ef6c3e]">{active + 1}</span>
                {' '}/ {FEATURES.length}
              </span>
            </div>

            {/* Animated text */}
            <div className="relative" style={{ height: 280 }}>
              {FEATURES.map((f, i) => (
                <div
                  key={f.title}
                  className="absolute inset-0"
                  style={{
                    opacity: active === i ? 1 : 0,
                    transform:
                      active === i
                        ? 'translateY(0)'
                        : active > i
                        ? 'translateY(-20px)'
                        : 'translateY(20px)',
                    pointerEvents: active === i ? 'auto' : 'none',
                    transition:
                      'opacity 500ms cubic-bezier(0.4,0,0.2,1), transform 500ms cubic-bezier(0.4,0,0.2,1)',
                  }}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="h-11 w-11 rounded-xl flex items-center justify-center"
                      style={{ background: f.iconBg, color: f.iconColor }}
                    >
                      {f.icon}
                    </div>
                    {f.tag && (
                      <span
                        className="rounded-lg px-2.5 py-1 text-[11px] font-bold"
                        style={{ background: 'rgba(15,118,110,0.1)', color: '#0f766e' }}
                      >
                        {f.tag}
                      </span>
                    )}
                  </div>

                  <h2
                    className="text-4xl font-bold mb-4 leading-tight"
                    style={{
                      fontFamily: 'Sora, sans-serif',
                      letterSpacing: '-0.02em',
                      color: '#2a2127',
                    }}
                  >
                    {f.title}
                  </h2>
                  <p className="text-lg leading-relaxed" style={{ color: '#75636f' }}>
                    {f.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: mock preview */}
          <div className="relative shrink-0" style={{ height: '65vh' }}>
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="absolute"
                style={{
                  top: 0,
                  bottom: 0,
                  left: '2rem',
                  right: '4rem',
                  opacity: active === i ? 1 : 0,
                  transform:
                    active === i
                      ? 'translateY(0) scale(1)'
                      : active > i
                      ? 'translateY(-16px) scale(0.97)'
                      : 'translateY(16px) scale(0.97)',
                  pointerEvents: active === i ? 'auto' : 'none',
                  transition:
                    'opacity 500ms cubic-bezier(0.4,0,0.2,1), transform 500ms cubic-bezier(0.4,0,0.2,1)',
                }}
              >
                {f.mock}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mobile: stacked cards ───────────────────────────────────────── */}
      <section className="mobile-only py-20 px-5" style={{ background: '#fff7f2' }}>
        <div className="text-center mb-14">
          <p className="section-label mb-3">Features</p>
          <h2 className="section-title">Everything you need to build great conversations</h2>
        </div>
        <div className="space-y-16">
          {FEATURES.map((f) => (
            <div key={f.title}>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center"
                  style={{ background: f.iconBg, color: f.iconColor }}
                >
                  {f.icon}
                </div>
                <h3
                  className="text-xl font-bold"
                  style={{ fontFamily: 'Sora, sans-serif', color: '#2a2127' }}
                >
                  {f.title}
                </h3>
              </div>
              <p className="text-base leading-relaxed mb-6" style={{ color: '#75636f' }}>
                {f.description}
              </p>
              <div style={{ height: 320 }}>{f.mock}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
