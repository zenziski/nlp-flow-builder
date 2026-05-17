import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Clock,
  Globe,
  Terminal,
  Check,
  ShieldAlert,
  Workflow,
} from 'lucide-react';
import { botsService } from '../services/bots.service';
import { flowsService } from '../services/flows.service';
import type { Bot } from '../types/bot.types';
import type { Flow } from '../types/flow.types';
import Button from '../components/ui/Button';

const API_BASE = import.meta.env.VITE_API_URL as string | undefined;
const RUNTIME_BASE = import.meta.env.VITE_RUNTIME_URL
  ?? (API_BASE ? API_BASE.replace(/\/api\/v\d+\/?$/, '') : window.location.origin);

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      onClick={copy}
      title="Copy"
      className="flex items-center justify-center rounded-lg p-1.5 text-[#9e7f6f] transition-colors hover:bg-[#fff0e4] hover:text-[var(--brand)]"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-[var(--accent)]" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative mt-2 rounded-xl border border-[#e4cfc4] bg-[#1e1410] p-4 font-mono text-xs leading-relaxed text-[#f4d8c8]">
      <CopyButton value={code} />
      <div className="absolute right-2.5 top-2.5">
        <CopyButton value={code} />
      </div>
      <pre className="overflow-x-auto whitespace-pre pr-8">{code}</pre>
    </div>
  );
}

function CredentialField({
  label,
  value,
  secret = false,
}: {
  label: string;
  value: string;
  secret?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const display = secret && !visible ? '•'.repeat(Math.min(value.length, 40)) : value;

  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#9e7f6f]">
        {label}
      </p>
      <div className="flex items-center gap-1.5 rounded-xl border border-[#e4cfc4] bg-[#fff8f4] px-3 py-2">
        <span className="flex-1 truncate font-mono text-sm text-slate-800">{display}</span>
        {secret && (
          <button
            onClick={() => setVisible((v) => !v)}
            title={visible ? 'Hide' : 'Reveal'}
            className="flex items-center justify-center rounded-lg p-1.5 text-[#9e7f6f] transition-colors hover:bg-[#fff0e4] hover:text-[var(--brand)]"
          >
            {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        )}
        <CopyButton value={value} />
      </div>
    </div>
  );
}

export default function BotConfigPage() {
  const { botId } = useParams<{ botId: string }>();
  const navigate = useNavigate();

  const [bot, setBot] = useState<Bot | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeout, setTimeout_] = useState(0);
  const [savingTimeout, setSavingTimeout] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [confirmRegen, setConfirmRegen] = useState(false);
  const [flows, setFlows] = useState<Flow[]>([]);
  const [selectedMainFlow, setSelectedMainFlow] = useState<string>('');
  const [savingMainFlow, setSavingMainFlow] = useState(false);

  const load = useCallback(async () => {
    if (!botId) return;
    try {
      setLoading(true);
      const [data, flowList] = await Promise.all([
        botsService.findOne(botId),
        flowsService.findAll(botId),
      ]);
      setBot(data);
      setFlows(flowList);
      setTimeout_(data.settings?.sessionTimeoutMinutes ?? 0);
      setSelectedMainFlow(data.mainFlowId ?? '');
    } catch {
      toast.error('Failed to load bot configuration');
    } finally {
      setLoading(false);
    }
  }, [botId]);

  useEffect(() => { load(); }, [load]);

  const handleSaveTimeout = async () => {
    if (!bot) return;
    setSavingTimeout(true);
    try {
      const updated = await botsService.update(bot._id, {
        settings: { ...bot.settings, sessionTimeoutMinutes: timeout },
      });
      setBot(updated);
      toast.success('Session timeout saved');
    } catch {
      toast.error('Failed to save timeout');
    } finally {
      setSavingTimeout(false);
    }
  };

  const handleRegenerate = async () => {
    if (!bot) return;
    setRegenerating(true);
    try {
      const updated = await botsService.regenerateSecret(bot._id);
      setBot(updated);
      setConfirmRegen(false);
      toast.success('Client secret regenerated');
    } catch {
      toast.error('Failed to regenerate secret');
    } finally {
      setRegenerating(false);
    }
  };

  const handleSaveMainFlow = async () => {
    if (!bot) return;
    setSavingMainFlow(true);
    try {
      const updated = await botsService.setMainFlow(bot._id, selectedMainFlow || null);
      setBot(updated);
      toast.success(selectedMainFlow ? 'Main flow set' : 'Main flow cleared');
    } catch {
      toast.error('Failed to save main flow');
    } finally {
      setSavingMainFlow(false);
    }
  };

  const runtimeUrl = `${RUNTIME_BASE}/api/conversation/start`;
  const messageUrl = `${RUNTIME_BASE}/api/conversation/<sessionId>/message`;
  const messagePayload = JSON.stringify({ text: 'Hello!' }, null, 2);
  const messageCurl = `curl -X POST "${RUNTIME_BASE}/api/conversation/<sessionId>/message" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Hello!"}'`;
  const examplePayload = bot
    ? JSON.stringify(
        { clientId: bot.clientId ?? '<clientId>', clientSecret: '<clientSecret>', userId: 'user_123' },
        null,
        2,
      )
    : '';

  const curlExampleObj = bot
    ? { clientId: bot.clientId ?? '<clientId>', clientSecret: '<clientSecret>', userId: 'user_123' }
    : {};

  const curlExample = bot
    ? `curl -X POST "${runtimeUrl}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(curlExampleObj)}'`
    : '';

  const startResponseExample = JSON.stringify(
    {
      sessionId: '64f1a2b3c4d5e6f7a8b9c0d1',
      outputs: [],
      waitForInput: true,
      sessionEnded: false,
      variables: {},
    },
    null,
    2,
  );

  const messageResponseExample = JSON.stringify(
    {
      outputs: [{ type: 'text', content: 'Sure, I can help with that!' }],
      waitForInput: true,
      sessionEnded: false,
      variables: {},
    },
    null,
    2,
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="surface-panel p-8 text-sm text-[#9e7f6f]">Loading configuration…</div>
      </div>
    );
  }

  if (!bot) return null;

  return (
    <div className="mx-auto max-w-3xl px-3 py-5 md:px-4 md:py-7">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/bots')}
          className="mb-4 flex items-center gap-1.5 text-sm text-[#9e7f6f] transition-colors hover:text-[var(--brand)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Bots
        </button>
        <h1 className="page-title">{bot.name}</h1>
        <p className="page-subtitle mt-1">Configuration &amp; Integration</p>
      </div>

      <div className="space-y-5">
        {/* Session timeout */}
        <section className="surface-card p-5 md:p-6">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ffe6d8]">
              <Clock className="h-4.5 w-4.5 h-[18px] w-[18px] text-[var(--brand)]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Session Timeout</h2>
              <p className="text-xs text-[#9e7f6f]">
                How long before an idle conversation session expires
              </p>
            </div>
          </div>

          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-[#9e7f6f]">
                Timeout (minutes)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={1440}
                  value={timeout}
                  onChange={(e) => setTimeout_(Number(e.target.value))}
                  className="w-32 rounded-xl border border-[#e4cfc4] bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[rgba(211,90,47,0.18)]"
                />
                <span className="text-sm text-[#9e7f6f]">
                  {timeout === 0 ? '— no timeout' : timeout === 1 ? '1 minute' : `${timeout} minutes`}
                </span>
              </div>
            </div>
            <Button
              onClick={handleSaveTimeout}
              disabled={savingTimeout || timeout === (bot.settings?.sessionTimeoutMinutes ?? 0)}
              className="shrink-0"
            >
              {savingTimeout ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </section>

        {/* Main flow */}
        <section className="surface-card p-5 md:p-6">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ffe6d8]">
              <Workflow className="h-[18px] w-[18px] text-[var(--brand)]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Main Flow</h2>
              <p className="text-xs text-[#9e7f6f]">
                The default entry point when no <code className="rounded bg-[#ffe6d8] px-1 font-mono text-[#c25229]">flowId</code> is passed to the Runtime API
              </p>
            </div>
          </div>

          {flows.length === 0 ? (
            <p className="text-sm text-[#9e7f6f]">No flows yet — create one first in the builder.</p>
          ) : (
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-[#9e7f6f]">
                  Select flow
                </label>
                <select
                  value={selectedMainFlow}
                  onChange={(e) => setSelectedMainFlow(e.target.value)}
                  className="w-full rounded-xl border border-[#e4cfc4] bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[rgba(211,90,47,0.18)]"
                >
                  <option value="">— None —</option>
                  {flows.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.name}{f.published ? '' : ' (draft)'}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={handleSaveMainFlow}
                disabled={savingMainFlow || selectedMainFlow === (bot.mainFlowId ?? '')}
                className="shrink-0"
              >
                {savingMainFlow ? 'Saving…' : 'Save'}
              </Button>
            </div>
          )}
        </section>

        {/* Runtime API section */}
        <section className="surface-card p-5 md:p-6">
          <div className="mb-5 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ffe6d8]">
              <Globe className="h-[18px] w-[18px] text-[var(--brand)]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Runtime API</h2>
              <p className="text-xs text-[#9e7f6f]">
                Integrate this bot into any external application
              </p>
            </div>
          </div>

          {/* Endpoint */}
          <div className="mb-5">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#9e7f6f]">
              Endpoint
            </p>
            <div className="flex items-center gap-1.5 rounded-xl border border-[#e4cfc4] bg-[#fff8f4] px-3 py-2">
              <span className="mr-1.5 rounded-md bg-[#ffe6d8] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--brand)]">
                POST
              </span>
              <span className="flex-1 truncate font-mono text-sm text-slate-800">{runtimeUrl}</span>
              <CopyButton value={runtimeUrl} />
            </div>
          </div>

          {/* Credentials */}
          <div className="mb-5 space-y-3">
            <CredentialField label="Client ID" value={bot.clientId ?? ''} />
            <CredentialField label="Client Secret" value={bot.clientSecret ?? ''} secret />

            <div className="flex items-start gap-2 rounded-xl border border-[#f5ddd0] bg-[#fff5ef] px-3 py-2.5">
              <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--brand)]" />
              <p className="text-xs text-[#7a5243]">
                Keep your Client Secret private. Never expose it in client-side code.
                Regenerating it will immediately invalidate all existing integrations.
              </p>
            </div>

            <div className="flex justify-end">
              {confirmRegen ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[#b84f2b]">Invalidates all integrations. Sure?</span>
                  <button
                    onClick={handleRegenerate}
                    disabled={regenerating}
                    className="rounded-lg bg-[#b84f2b] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#a0421f] disabled:opacity-50"
                  >
                    {regenerating ? 'Regenerating…' : 'Yes, regenerate'}
                  </button>
                  <button
                    onClick={() => setConfirmRegen(false)}
                    className="rounded-lg border border-[#e4cfc4] px-2.5 py-1 text-xs font-semibold hover:bg-[#fff0e4]"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmRegen(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-[#e4cfc4] px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-[#d35a2f] hover:bg-[#fff0e4] hover:text-[#b84f2b]"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Regenerate secret
                </button>
              )}
            </div>
          </div>

          {/* Code examples */}
          <div className="border-t border-[#efd6ca] pt-5">
            <div className="mb-3 flex items-center gap-2">
              <Terminal className="h-4 w-4 text-[#9e7f6f]" />
              <p className="text-sm font-semibold text-slate-800">Quick start</p>
            </div>

            {/* Step 1 – start */}
            <div className="mb-1 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#ffe6d8] text-[10px] font-bold text-[var(--brand)]">1</span>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#9e7f6f]">
                Start a session — request payload
              </p>
            </div>
            <CodeBlock code={examplePayload} />

            <p className="mb-1 mt-3 text-xs font-semibold uppercase tracking-widest text-[#9e7f6f]">
              cURL
            </p>
            <CodeBlock code={curlExample} />

            <p className="mb-1 mt-3 text-xs font-semibold uppercase tracking-widest text-[#9e7f6f]">
              Example response
            </p>
            <CodeBlock code={startResponseExample} />

            {/* Step 2 – message */}
            <div className="mb-1 mt-6 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#ffe6d8] text-[10px] font-bold text-[var(--brand)]">2</span>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#9e7f6f]">
                Send a message
              </p>
            </div>
            <div className="mb-2 flex items-center gap-1.5 rounded-xl border border-[#e4cfc4] bg-[#fff8f4] px-3 py-2">
              <span className="mr-1.5 rounded-md bg-[#ffe6d8] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--brand)]">
                POST
              </span>
              <span className="flex-1 truncate font-mono text-sm text-slate-800">{messageUrl}</span>
              <CopyButton value={messageUrl} />
            </div>

            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#9e7f6f]">
              Request payload
            </p>
            <CodeBlock code={messagePayload} />

            <p className="mb-1 mt-3 text-xs font-semibold uppercase tracking-widest text-[#9e7f6f]">
              cURL
            </p>
            <CodeBlock code={messageCurl} />

            <p className="mb-1 mt-3 text-xs font-semibold uppercase tracking-widest text-[#9e7f6f]">
              Example response
            </p>
            <CodeBlock code={messageResponseExample} />
          </div>
        </section>
      </div>
    </div>
  );
}
