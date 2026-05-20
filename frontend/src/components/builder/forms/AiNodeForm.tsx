import { useState } from 'react';
import { Info } from 'lucide-react';
import { useNodesStore } from '../../../stores/useNodesStore';
import { VariableInput, VariableTextarea } from '../../ui/VariableSuggest';

interface Props { nodeId: string; data: any; }

type AiProvider = 'openai' | 'anthropic' | 'groq' | 'openrouter' | 'custom';

const PROVIDERS: { value: AiProvider; label: string }[] = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'groq', label: 'Groq' },
  { value: 'openrouter', label: 'OpenRouter' },
  { value: 'custom', label: 'Custom URL' },
];

const MODELS_BY_PROVIDER: Record<AiProvider, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  anthropic: ['claude-opus-4-5', 'claude-sonnet-4-5', 'claude-haiku-3-5'],
  groq: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
  openrouter: [],
  custom: [],
};

const inputCls =
  'w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-600 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';
const labelCls = 'text-xs text-slate-400';
const sectionCls = 'space-y-1';

export default function AiNodeForm({ nodeId, data }: Props) {
  const { updateNodeData } = useNodesStore();

  const [provider, setProvider] = useState<AiProvider>(data.provider ?? 'openai');
  const [model, setModel] = useState<string>(data.model ?? '');
  const [customModel, setCustomModel] = useState<string>(
    !MODELS_BY_PROVIDER[data.provider ?? 'openai']?.includes(data.model ?? '')
      ? (data.model ?? '')
      : '',
  );
  const [apiKey, setApiKey] = useState(data.apiKey ?? '');
  const [baseUrl, setBaseUrl] = useState(data.baseUrl ?? '');
  const [systemPrompt, setSystemPrompt] = useState(data.systemPrompt ?? '');
  const [prompt, setPrompt] = useState(data.prompt ?? '');
  const [saveResponseAs, setSaveResponseAs] = useState(data.saveResponseAs ?? '');
  const [temperature, setTemperature] = useState<number>(data.temperature ?? 0.7);
  const [maxTokens, setMaxTokens] = useState<number>(data.maxTokens ?? 1024);

  const persist = (patch: Record<string, unknown> = {}) => {
    updateNodeData(nodeId, {
      provider,
      model: effectiveModel(),
      apiKey,
      baseUrl,
      systemPrompt,
      prompt,
      saveResponseAs,
      temperature,
      maxTokens,
      ...patch,
    });
  };

  const effectiveModel = (overrides: { provider?: AiProvider; model?: string; custom?: string } = {}) => {
    const p = overrides.provider ?? provider;
    const m = overrides.model ?? model;
    const c = overrides.custom ?? customModel;
    const presets = MODELS_BY_PROVIDER[p];
    if (presets.length === 0) return c; // openrouter / custom: always use free-text
    return m === '__custom__' ? c : m;
  };

  const handleProviderChange = (p: AiProvider) => {
    setProvider(p);
    const presets = MODELS_BY_PROVIDER[p];
    const newModel = presets.length > 0 ? presets[0] : '';
    setModel(newModel);
    setCustomModel('');
    persist({ provider: p, model: presets.length > 0 ? newModel : customModel, baseUrl });
  };

  const handleModelChange = (m: string) => {
    setModel(m);
    persist({ model: effectiveModel({ model: m }) });
  };

  const handleCustomModelChange = (v: string) => {
    setCustomModel(v);
    persist({ model: v });
  };

  const presets = MODELS_BY_PROVIDER[provider];
  const showCustomModelInput = presets.length === 0 || model === '__custom__';

  return (
    <div className="space-y-3">
      {/* Provider */}
      <div className={sectionCls}>
        <label className={labelCls}>Provider</label>
        <select
          value={provider}
          onChange={(e) => handleProviderChange(e.target.value as AiProvider)}
          className={inputCls}
        >
          {PROVIDERS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Custom base URL */}
      {provider === 'custom' && (
        <div className={sectionCls}>
          <label className={labelCls}>Base URL</label>
          <input
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            onBlur={() => persist()}
            placeholder="https://my-llm-api.com/v1/chat/completions"
            className={inputCls}
          />
          <p className="text-[10px] text-slate-500">Must be OpenAI-compatible chat completions endpoint.</p>
        </div>
      )}

      {/* Model */}
      <div className={sectionCls}>
        <label className={labelCls}>Model</label>
        {presets.length > 0 ? (
          <select
            value={model || presets[0]}
            onChange={(e) => handleModelChange(e.target.value)}
            className={inputCls}
          >
            {presets.map((m) => <option key={m} value={m}>{m}</option>)}
            <option value="__custom__">Custom…</option>
          </select>
        ) : null}
        {showCustomModelInput && (
          <input
            value={customModel}
            onChange={(e) => handleCustomModelChange(e.target.value)}
            placeholder={presets.length > 0 ? 'Enter model name' : 'e.g. meta-llama/llama-3.1-70b'}
            className={`${inputCls} ${presets.length > 0 ? 'mt-1' : ''}`}
          />
        )}
      </div>

      {/* API Key */}
      <div className={sectionCls}>
        <div className="flex items-center justify-between">
          <label className={labelCls}>API Key</label>
          <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
            <Info className="w-2.5 h-2.5" /> use vault
          </span>
        </div>
        <VariableInput
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          onBlur={() => persist()}
          placeholder="{{vault.OPENAI_API_KEY}}"
          className={inputCls}
        />
        <p className="text-[10px] text-slate-500">
          Reference a vault variable:{' '}
          <code className="text-indigo-400">{'{{vault.YOUR_KEY}}'}</code>
        </p>
      </div>

      {/* System prompt */}
      <div className={sectionCls}>
        <label className={labelCls}>System prompt <span className="text-slate-600">(optional)</span></label>
        <VariableTextarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          onBlur={() => persist()}
          rows={3}
          placeholder="You are a helpful assistant…"
          className={`${inputCls} resize-none`}
        />
      </div>

      {/* User prompt */}
      <div className={sectionCls}>
        <label className={labelCls}>User prompt</label>
        <VariableTextarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onBlur={() => persist()}
          rows={4}
          placeholder="Answer the following: {{user.question}}"
          className={`${inputCls} resize-none`}
        />
        <p className="text-[10px] text-slate-500">Supports <code className="text-indigo-400">{'{{variable}}'}</code> interpolation.</p>
      </div>

      {/* Save response as */}
      <div className={sectionCls}>
        <label className={labelCls}>Save response to variable</label>
        <input
          value={saveResponseAs}
          onChange={(e) => setSaveResponseAs(e.target.value)}
          onBlur={() => persist()}
          placeholder="ai.response"
          className={inputCls}
        />
        {saveResponseAs && (
          <p className="text-[10px] text-slate-500">
            Response text → <code className="text-indigo-400">{`{{${saveResponseAs}}}`}</code>
            {' · '}
            Errors → <code className="text-indigo-400">{`{{${saveResponseAs}_error}}`}</code>
          </p>
        )}
      </div>

      {/* Advanced */}
      <details className="group">
        <summary className="cursor-pointer text-xs text-slate-500 hover:text-slate-300 select-none list-none flex items-center gap-1">
          <span className="text-slate-600 group-open:hidden">▶</span>
          <span className="text-slate-600 hidden group-open:inline">▼</span>
          Advanced parameters
        </summary>
        <div className="mt-2 space-y-2 pl-2 border-l border-slate-700">
          <div className={sectionCls}>
            <label className={labelCls}>Temperature: {temperature}</label>
            <input
              type="range" min="0" max="2" step="0.05"
              value={temperature}
              onChange={(e) => {
                const v = Number(e.target.value);
                setTemperature(v);
                persist({ temperature: v });
              }}
              className="w-full mt-1"
            />
            <div className="flex justify-between text-[10px] text-slate-600">
              <span>0 — precise</span>
              <span>2 — creative</span>
            </div>
          </div>
          <div className={sectionCls}>
            <label className={labelCls}>Max tokens</label>
            <input
              type="number"
              value={maxTokens}
              min={1}
              max={128000}
              onChange={(e) => {
                const v = Number(e.target.value);
                setMaxTokens(v);
                persist({ maxTokens: v });
              }}
              className={inputCls}
            />
          </div>
        </div>
      </details>

      {/* Output handles info */}
      <div className="rounded-lg bg-slate-800/60 border border-slate-700 p-2 space-y-1">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Output handles</p>
        <p className="text-[10px] text-slate-500">
          <span className="text-green-400 font-mono">success</span> — AI responded successfully
        </p>
        <p className="text-[10px] text-slate-500">
          <span className="text-red-400 font-mono">error</span> — API error or timeout
        </p>
      </div>
    </div>
  );
}
