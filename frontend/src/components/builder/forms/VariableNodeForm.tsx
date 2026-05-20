import { useState } from 'react';
import { useNodesStore } from '../../../stores/useNodesStore';
import { VariableInput } from '../../ui/VariableSuggest';

const ACTIONS = ['set', 'unset', 'increment', 'decrement', 'append'];
const SCOPES = ['session', 'global', 'temp'];

interface Props { nodeId: string; data: any; }

export default function VariableNodeForm({ nodeId, data }: Props) {
  const { updateNodeData } = useNodesStore();
  const [state, setState] = useState({ action: data.action ?? 'set', key: data.key ?? '', value: data.value ?? '' });

  const update = (patch: Partial<typeof state>) => {
    const next = { ...state, ...patch };
    setState(next);
    updateNodeData(nodeId, next);
  };

  return (
    <div className="space-y-2">
      <div>
        <label className="text-xs text-slate-400">Action</label>
        <select value={state.action} onChange={(e) => update({ action: e.target.value })}
          className="mt-0.5 w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-600 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500">
          {ACTIONS.map((a) => <option key={a}>{a}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs text-slate-400">Variable key</label>
        <input value={state.key} onChange={(e) => update({ key: e.target.value })} placeholder="user.name"
          className="mt-0.5 w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-600 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
      </div>
      {state.action !== 'unset' && (
        <div>
          <label className="text-xs text-slate-400">Value</label>
          <VariableInput value={state.value} onChange={(e) => update({ value: e.target.value })} placeholder="value or {{variable}}"
            className="mt-0.5 w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-600 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>
      )}
    </div>
  );
}
