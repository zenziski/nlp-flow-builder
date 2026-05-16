import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useNodesStore } from '../../../stores/useNodesStore';
import { useFlowStore } from '../../../stores/useFlowStore';
import { flowsService } from '../../../services/flows.service';
import type { Flow } from '../../../types/flow.types';

interface Props { nodeId: string; data: any; }

export default function SubflowNodeForm({ nodeId, data }: Props) {
  const { updateNodeData } = useNodesStore();
  const activeFlow = useFlowStore((s) => s.activeFlow);
  const botId = activeFlow?.botId;
  const currentFlowId = activeFlow?._id;

  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!botId) return;
    setLoading(true);
    flowsService
      .findAll(botId)
      .then((all: Flow[]) => {
        // Exclude the current flow to prevent self-reference
        setFlows(all.filter((f) => f._id !== currentFlowId));
      })
      .finally(() => setLoading(false));
  }, [botId, currentFlowId]);

  const handleChange = (flowId: string) => {
    const selected = flows.find((f) => f._id === flowId);
    updateNodeData(nodeId, {
      subflowId: flowId || undefined,
      subflowName: selected?.name ?? undefined,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium text-slate-300 mb-2">Referenced Flow</p>

        {loading ? (
          <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
            <Loader2 className="w-3 h-3 animate-spin" /> Loading flows…
          </div>
        ) : flows.length === 0 ? (
          <p className="text-xs text-slate-500 italic">
            No other flows found for this bot.
          </p>
        ) : (
          <select
            value={data.subflowId ?? ''}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-600 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">— select a flow —</option>
            {flows.map((f) => (
              <option key={f._id} value={f._id}>
                {f.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {data.subflowId && (
        <div className="text-xs text-slate-400 bg-slate-800/50 rounded px-2 py-2 border border-slate-700">
          <p className="font-medium text-slate-300 mb-0.5">How it works</p>
          <p>When execution reaches this node, the selected flow runs <span className="text-indigo-400">inline</span> — sharing the same variables and context. After it ends, execution continues to the next node here.</p>
        </div>
      )}
    </div>
  );
}
