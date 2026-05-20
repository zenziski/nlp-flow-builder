import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useNodesStore } from '../../../stores/useNodesStore';
import Button from '../../ui/Button';
import { VariableInput } from '../../ui/VariableSuggest';

interface SwitchCase { value: string; handle: string; }
interface Props { nodeId: string; data: any; }

export default function SwitchNodeForm({ nodeId, data }: Props) {
  const { updateNodeData } = useNodesStore();
  const [variable, setVariable] = useState(data.variable ?? '');
  const [cases, setCases] = useState<SwitchCase[]>(data.cases ?? []);

  const updateCases = (next: SwitchCase[]) => {
    setCases(next);
    updateNodeData(nodeId, { cases: next });
  };

  const addCase = () => {
    const idx = cases.length + 1;
    updateCases([...cases, { value: '', handle: `case${idx}` }]);
  };

  const removeCase = (i: number) => updateCases(cases.filter((_, idx) => idx !== i));

  const changeCase = (i: number, field: keyof SwitchCase, val: string) => {
    const next = [...cases];
    next[i] = { ...next[i], [field]: val };
    updateCases(next);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-slate-400">Variable to switch on</label>
        <VariableInput value={variable}
          onChange={(e) => { setVariable(e.target.value); updateNodeData(nodeId, { variable: e.target.value }); }}
          placeholder="{{user.status}}"
          className="mt-0.5 w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-600 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono" />
      </div>
      <div>
        <p className="text-xs text-slate-400 mb-1">Cases</p>
        {cases.map((c, i) => (
          <div key={i} className="flex gap-1 mb-1">
            <input value={c.value} onChange={(e) => changeCase(i, 'value', e.target.value)} placeholder="value"
              className="flex-1 px-2 py-1 rounded bg-slate-800 border border-slate-600 text-xs text-slate-100 placeholder-slate-500 focus:outline-none" />
            <input value={c.handle} onChange={(e) => changeCase(i, 'handle', e.target.value)} placeholder="handle"
              className="w-20 px-2 py-1 rounded bg-slate-800 border border-slate-600 text-xs text-slate-100 placeholder-slate-500 focus:outline-none font-mono" />
            <button onClick={() => removeCase(i)} className="text-slate-500 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
          </div>
        ))}
        <p className="text-xs text-slate-600 italic">+ default (always present)</p>
        <Button variant="ghost" size="sm" onClick={addCase} className="mt-1 w-full"><Plus className="w-3 h-3" /> Add case</Button>
      </div>
    </div>
  );
}
