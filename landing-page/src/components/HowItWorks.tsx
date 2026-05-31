import { Workflow, BrainCircuit, Rocket } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';
import type { ReactNode } from 'react';

const steps = [
  {
    number: '01',
    icon: <Workflow className="h-6 w-6" />,
    title: 'Design your flow',
    description:
      'Open the visual editor and start placing nodes. Connect a greeting, add a condition, route to different paths — all with drag and drop. Your conversation architecture is always visible at a glance.',
    detail: 'Supports 12+ node types including messages, conditions, API calls, and delays.',
    color: '#ef6c3e',
    bg: '#ffe6d8',
    mock: (
      <div
        className="rounded-card border overflow-hidden"
        style={{ borderColor: '#ebd6cc', background: '#fff2e8' }}
      >
        <div className="p-4 relative h-40">
          <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid2" width="16" height="16" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.7" fill="#c9a090" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid2)" />
          </svg>
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <path d="M 60 50 C 110 50 110 80 160 80" stroke="#b78775" strokeWidth="1.5" fill="none" />
            <path d="M 255 80 C 305 80 305 50 355 50" stroke="#b78775" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
            <path d="M 255 80 C 305 80 305 110 355 110" stroke="#b78775" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
          </svg>
          {[
            { left: 12, top: 36, label: 'Start', dot: '#0f766e', width: 64 },
            { left: 130, top: 64, label: 'Message', dot: '#ef6c3e', width: 88 },
            { left: 327, top: 34, label: 'Yes path', dot: '#0f766e', width: 78 },
            { left: 327, top: 96, label: 'No path', dot: '#b9382f', width: 72 },
          ].map((n) => (
            <div
              key={n.label}
              className="absolute flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[10px] font-semibold border"
              style={{ left: n.left, top: n.top, background: '#fff', borderColor: '#ebd6cc', color: '#2a2127', width: n.width }}
            >
              <div className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: n.dot }} />
              {n.label}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    number: '02',
    icon: <BrainCircuit className="h-6 w-6" />,
    title: 'Train your NLP',
    description:
      'Add training phrases to teach your bot what users mean. Zenflow\'s built-in NLP engine clusters intents, extracts entities, and improves confidence scores as you add more examples.',
    detail: 'Supports multi-language training — Portuguese, English, Spanish, and more.',
    color: '#0f766e',
    bg: 'rgba(15,118,110,0.1)',
    mock: (
      <div
        className="rounded-card border overflow-hidden"
        style={{ borderColor: '#ebd6cc', background: '#ffffff' }}
      >
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: '#ebd6cc', background: '#fff8f2' }}
        >
          <p className="text-xs font-bold" style={{ color: '#2a2127' }}>Intent: greeting</p>
          <span
            className="text-[10px] font-bold rounded-lg px-2 py-0.5"
            style={{ background: 'rgba(15,118,110,0.1)', color: '#0f766e' }}
          >
            94% confidence
          </span>
        </div>
        <div className="p-4 flex flex-col gap-2">
          {['Hello there!', 'Hey, how are you?', 'Good morning', 'Hi bot!', 'Oi tudo bem?'].map((phrase, i) => (
            <div
              key={phrase}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs"
              style={{ background: i % 2 === 0 ? '#fff0e4' : '#f9f2ee', color: '#2a2127' }}
            >
              <div className="h-1.5 w-1.5 rounded-full bg-[#0f766e] flex-shrink-0" />
              {phrase}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    number: '03',
    icon: <Rocket className="h-6 w-6" />,
    title: 'Deploy & iterate',
    description:
      'Publish your bot with one click. Monitor sessions, message counts, and conversation paths in real time. Use the simulator to test changes before shipping them live.',
    detail: 'Zero-downtime deploys. Rollback to any previous version in seconds.',
    color: '#ef6c3e',
    bg: '#ffe6d8',
    mock: (
      <div
        className="rounded-card border overflow-hidden"
        style={{ borderColor: '#ebd6cc', background: '#ffffff' }}
      >
        <div
          className="flex items-center gap-2.5 px-4 py-3 border-b"
          style={{ borderColor: '#ebd6cc', background: '#fff8f2' }}
        >
          <div className="h-2 w-2 rounded-full bg-[#0f766e] animate-pulse" />
          <p className="text-xs font-bold" style={{ color: '#2a2127' }}>support-bot — Live</p>
        </div>
        <div className="grid grid-cols-3 gap-3 p-4">
          {[
            { label: 'Sessions', value: '1,842' },
            { label: 'Messages', value: '9,310' },
            { label: 'Users', value: '743' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-lg font-bold" style={{ color: '#2a2127', fontFamily: 'Sora' }}>{stat.value}</p>
              <p className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: '#9f7969' }}>{stat.label}</p>
            </div>
          ))}
        </div>
        <div className="px-4 pb-4">
          <div className="h-16 flex items-end gap-1">
            {[40, 55, 35, 70, 60, 80, 65].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-md transition-all"
                style={{ height: `${h}%`, background: i === 5 ? '#ef6c3e' : '#ffe6d8' }}
              />
            ))}
          </div>
          <p className="mt-1 text-[9px] text-right" style={{ color: '#9f7969' }}>Last 7 days</p>
        </div>
      </div>
    ),
  },
];

interface Step {
  number: string;
  icon: ReactNode;
  title: string;
  description: string;
  detail: string;
  color: string;
  bg: string;
  mock: ReactNode;
}

function StepRow({ step, index }: { step: Step; index: number }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center reveal ${visible ? 'is-visible' : ''} ${
        index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
      }`}
    >
      {/* Content */}
      <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
        <div className="flex items-center gap-3 mb-4">
          <div
            className="flex items-center justify-center h-11 w-11 rounded-xl"
            style={{ background: step.bg, color: step.color }}
          >
            {step.icon}
          </div>
          <span
            className="text-xs font-black tracking-[0.2em] opacity-40"
            style={{ fontFamily: 'Sora', color: step.color }}
          >
            {step.number}
          </span>
        </div>
        <h3
          className="text-2xl font-bold mb-3"
          style={{ fontFamily: 'Sora, sans-serif', color: '#2a2127', letterSpacing: '-0.015em' }}
        >
          {step.title}
        </h3>
        <p className="text-base leading-relaxed mb-4" style={{ color: '#75636f' }}>
          {step.description}
        </p>
        <div
          className="flex items-center gap-2 rounded-xl border px-4 py-3"
          style={{ background: step.bg, borderColor: 'transparent' }}
        >
          <div className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: step.color }} />
          <p className="text-xs font-semibold" style={{ color: step.color }}>
            {step.detail}
          </p>
        </div>
      </div>
      {/* Mock */}
      <div className={index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
        {step.mock}
      </div>
    </div>
  );
}

export default function HowItWorks() {
  const header = useReveal<HTMLDivElement>();
  return (
    <section id="how-it-works" className="py-24" style={{ background: '#fff7f2' }}>
      <div className="mx-auto max-w-6xl px-5">
        {/* Header */}
        <div ref={header.ref} className={`mb-16 text-center reveal ${header.visible ? 'is-visible' : ''}`}>
          <p className="section-label mb-3">How it works</p>
          <h2 className="section-title mb-4">
            From idea to deployed bot in{' '}
            <span style={{ color: '#ef6c3e' }}>three steps</span>
          </h2>
          <p className="section-subtitle mx-auto max-w-md">
            No onboarding calls. No lengthy setup. Just open the builder and start creating.
          </p>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-20">
          {steps.map((step, index) => (
            <StepRow key={step.number} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
