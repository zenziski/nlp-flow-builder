import { useState } from 'react';
import { useNodesStore } from '../../../stores/useNodesStore';

const OPERATORS = ['equals', 'notEquals', 'contains', 'regex', 'greaterThan', 'lowerThan', 'exists', 'notExists'];

interface Props { nodeId: string; data: any; }

export default function ConditionNodeForm({ nodeId, data }: Props) {
  const { updateNodeData } = useNodesStore();
  const [cond, setCond] = useState(data.condition ?? { left: '', operator: 'equals', right: '' });

  const update = (patch: Partial<typeof cond>) => {
    const next = { ...cond, ...patch };
    setCond(next);
    updateNodeData(nodeId, { condition: next });
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-400">If condition is true → "yes" handle, otherwise → "no"</p>
      <div>
        <label className="text-xs text-slate-400">Left value</label>
        <input
          value={cond.left}
          onChange={(e) => update({ left: e.target.value })}
          placeholder="{{variable}} or literal"
          className="mt-0.5 w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-600 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label className="text-xs text-slate-400">Operator</label>
        <select
          value={cond.operator}
          onChange={(e) => update({ operator: e.target.value })}
          className="mt-0.5 w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-600 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {OPERATORS.map((op) => <option key={op} value={op}>{op}</option>)}
        </select>
      </div>
      {!['exists', 'notExists'].includes(cond.operator) && (
        <div>
          <label className="text-xs text-slate-400">Right value</label>
          <input
            value={cond.right}
            onChange={(e) => update({ right: e.target.value })}
            placeholder="value to compare"
            className="mt-0.5 w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-600 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      )}
    </div>
  );
}
