import { useNodesStore } from '../../../stores/useNodesStore';

interface Props { nodeId: string; data: any; }

export default function DelayNodeForm({ nodeId, data }: Props) {
  const { updateNodeData } = useNodesStore();
  const ms = data.delayMs ?? 1000;

  return (
    <div className="space-y-2">
      <label className="text-xs text-slate-400">Delay duration: {ms >= 1000 ? `${ms / 1000}s` : `${ms}ms`}</label>
      <input type="range" min="500" max="10000" step="500" value={ms}
        onChange={(e) => updateNodeData(nodeId, { delayMs: Number(e.target.value) })}
        className="w-full" />
      <p className="text-xs text-slate-500">Range: 500ms – 10s</p>
    </div>
  );
}
