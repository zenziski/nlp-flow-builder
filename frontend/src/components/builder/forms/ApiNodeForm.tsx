import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useNodesStore } from '../../../stores/useNodesStore';
import { VariableInput, VariableTextarea } from '../../ui/VariableSuggest';

interface HeaderRow { key: string; value: string; }
interface MappingRow { path: string; saveAs: string; }
interface Props { nodeId: string; data: any; }

function headersToRows(headers: Record<string, string> | undefined): HeaderRow[] {
  if (!headers || typeof headers !== 'object') return [];
  return Object.entries(headers).map(([key, value]) => ({ key, value }));
}

function rowsToHeaders(rows: HeaderRow[]): Record<string, string> {
  return Object.fromEntries(rows.filter((r) => r.key.trim()).map((r) => [r.key, r.value]));
}

export default function ApiNodeForm({ nodeId, data }: Props) {
  const { updateNodeData } = useNodesStore();
  const [state, setState] = useState({
    method: data.method ?? 'GET',
    url: data.url ?? '',
    body: data.body ?? '',
  });
  const [headers, setHeaders] = useState<HeaderRow[]>(headersToRows(data.headers));
  const [mappings, setMappings] = useState<MappingRow[]>(
    Array.isArray(data.responseMapping) ? data.responseMapping : [],
  );

  const persist = (
    nextState = state,
    nextHeaders = headers,
    nextMappings = mappings,
  ) => {
    updateNodeData(nodeId, {
      ...nextState,
      headers: rowsToHeaders(nextHeaders),
      responseMapping: nextMappings.filter((m) => m.path.trim() && m.saveAs.trim()),
    });
  };

  const update = (patch: Partial<typeof state>) => {
    const next = { ...state, ...patch };
    setState(next);
    persist(next, headers, mappings);
  };

  const updateHeaders = (next: HeaderRow[]) => {
    setHeaders(next);
    persist(state, next, mappings);
  };

  const updateMappings = (next: MappingRow[]) => {
    setMappings(next);
    persist(state, headers, next);
  };

  const addHeader = () => updateHeaders([...headers, { key: '', value: '' }]);
  const removeHeader = (i: number) => updateHeaders(headers.filter((_, idx) => idx !== i));
  const changeHeader = (i: number, field: keyof HeaderRow, val: string) =>
    updateHeaders(headers.map((h, idx) => (idx === i ? { ...h, [field]: val } : h)));

  const addMapping = () => updateMappings([...mappings, { path: '', saveAs: '' }]);
  const removeMapping = (i: number) => updateMappings(mappings.filter((_, idx) => idx !== i));
  const changeMapping = (i: number, field: keyof MappingRow, val: string) =>
    updateMappings(mappings.map((m, idx) => (idx === i ? { ...m, [field]: val } : m)));

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <select value={state.method} onChange={(e) => update({ method: e.target.value })}
          className="px-2 py-1.5 rounded bg-slate-800 border border-slate-600 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-20">
          {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => <option key={m}>{m}</option>)}
        </select>
        <VariableInput value={state.url} onChange={(e) => update({ url: e.target.value })} placeholder="https://api.example.com/endpoint"
          className="flex-1 px-2 py-1.5 rounded bg-slate-800 border border-slate-600 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-slate-400">Headers</label>
          <button onClick={addHeader} className="flex items-center gap-0.5 text-xs text-indigo-400 hover:text-indigo-300">
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
        {headers.length > 0 && (
          <div className="space-y-1">
            {headers.map((h, i) => (
              <div key={i} className="flex gap-1 items-center">
                <input value={h.key} onChange={(e) => changeHeader(i, 'key', e.target.value)}
                  placeholder="Key"
                  className="w-[38%] px-2 py-1 rounded bg-slate-800 border border-slate-600 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                <VariableInput value={h.value} onChange={(e) => changeHeader(i, 'value', e.target.value)}
                  placeholder="Value"
                  className="flex-1 px-2 py-1 rounded bg-slate-800 border border-slate-600 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                <button onClick={() => removeHeader(i)} className="text-slate-500 hover:text-red-400 flex-shrink-0">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {['POST', 'PUT', 'PATCH'].includes(state.method) && (
        <div>
          <label className="text-xs text-slate-400">Request body (JSON)</label>
          <VariableTextarea value={state.body} onChange={(e) => update({ body: e.target.value })} rows={3} placeholder='{"key": "{{variable}}"}'
            className="mt-0.5 w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-600 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-mono" />
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-slate-400">Save response data</label>
          <button onClick={addMapping} className="flex items-center gap-0.5 text-xs text-indigo-400 hover:text-indigo-300">
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
        {mappings.length > 0 && (
          <div className="space-y-1">
            {mappings.map((m, i) => (
              <div key={i} className="flex gap-1 items-center">
                <input value={m.path} onChange={(e) => changeMapping(i, 'path', e.target.value)}
                  placeholder="data.user.name"
                  className="w-[48%] px-2 py-1 rounded bg-slate-800 border border-slate-600 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono" />
                <input value={m.saveAs} onChange={(e) => changeMapping(i, 'saveAs', e.target.value)}
                  placeholder="varName"
                  className="flex-1 px-2 py-1 rounded bg-slate-800 border border-slate-600 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                <button onClick={() => removeMapping(i)} className="text-slate-500 hover:text-red-400 flex-shrink-0">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        {mappings.length > 0 && (
          <p className="text-xs text-slate-500 mt-1">Path uses dot notation · saved as <code className="text-indigo-400">{'{{varName}}'}</code></p>
        )}
      </div>

      <p className="text-xs text-slate-500">Outputs: "success" and "error" handles</p>
    </div>
  );
}

