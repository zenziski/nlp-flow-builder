import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useNodesStore } from '../../../stores/useNodesStore';
import { useFlowStore } from '../../../stores/useFlowStore';
import { useNlpStore } from '../../../stores/useNlpStore';

interface Props { nodeId: string; data: any; }

export default function IntentNodeForm({ nodeId, data }: Props) {
  const { updateNodeData } = useNodesStore();
  const botId = useFlowStore((s) => s.activeFlow?.botId);

  const fetchIntents = useNlpStore((s) => s.fetchIntents);
  const availableIntents = useNlpStore((s) => botId ? s.intentsByBot[botId] : undefined) ?? [];
  const loadingIntents = useNlpStore((s) => botId ? s.loadingByBot[botId] : undefined) ?? false;

  const [selected, setSelected] = useState<string[]>(data.intents ?? []);
  const [confidence, setConfidence] = useState(data.confidenceThreshold ?? 0.6);

  useEffect(() => {
    if (botId) fetchIntents(botId);
  }, [botId]);

  const toggle = (name: string) => {
    const next = selected.includes(name)
      ? selected.filter((s) => s !== name)
      : [...selected, name];
    setSelected(next);
    updateNodeData(nodeId, { intents: next });
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium text-slate-300 mb-2">
          Intents — each creates an output handle
        </p>

        {loadingIntents ? (
          <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
            <Loader2 className="w-3 h-3 animate-spin" /> Loading intents…
          </div>
        ) : availableIntents.length === 0 ? (
          <p className="text-xs text-slate-500 italic">
            No intents found for this bot. Go to&nbsp;
            <span className="text-indigo-400">Bots → NLP</span> to create them.
          </p>
        ) : (
          <div className="space-y-1">
            {availableIntents.map((intent) => {
              const isChecked = selected.includes(intent.name);
              return (
                <label
                  key={intent._id}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
                    isChecked
                      ? 'bg-indigo-900/40 border border-indigo-700'
                      : 'bg-slate-800 border border-transparent hover:border-slate-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggle(intent.name)}
                    className="accent-indigo-500"
                  />
                  <span className="text-xs text-slate-200 font-mono flex-1">{intent.name}</span>
                  <span className="text-xs text-slate-500">{intent.examples.length} ex.</span>
                </label>
              );
            })}
          </div>
        )}

        <p className="text-xs text-slate-600 italic mt-2">+ fallback (always present)</p>
      </div>

      <div>
        <label className="text-xs font-medium text-slate-300">
          Confidence threshold: {confidence}
        </label>
        <input
          type="range" min="0" max="1" step="0.05"
          value={confidence}
          onChange={(e) => {
            const v = Number(e.target.value);
            setConfidence(v);
            updateNodeData(nodeId, { confidenceThreshold: v });
          }}
          className="w-full mt-1"
        />
      </div>
    </div>
  );
}
