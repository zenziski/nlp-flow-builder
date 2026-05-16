import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useNodesStore } from '../../../stores/useNodesStore';
import Button from '../../ui/Button';

interface Props { nodeId: string; data: any; }

export default function MessageNodeForm({ nodeId, data }: Props) {
  const { updateNodeData } = useNodesStore();
  const [messages, setMessages] = useState<string[]>(data.messages ?? ['']);

  const update = (msgs: string[]) => {
    setMessages(msgs);
    updateNodeData(nodeId, { messages: msgs });
  };

  const change = (i: number, val: string) => {
    const next = [...messages]; next[i] = val; update(next);
  };

  const add = () => update([...messages, '']);
  const remove = (i: number) => update(messages.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-400">Messages (sent in sequence)</p>
      {messages.map((msg, i) => (
        <div key={i} className="flex gap-1">
          <textarea
            value={msg}
            onChange={(e) => change(i, e.target.value)}
            rows={2}
            placeholder="Enter message… use {{variable}}"
            className="flex-1 px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-600 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
          />
          {messages.length > 1 && (
            <button onClick={() => remove(i)} className="text-slate-500 hover:text-red-400 self-start mt-1">
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}
      <Button variant="ghost" size="sm" onClick={add} className="w-full">
        <Plus className="w-3 h-3" /> Add message
      </Button>
    </div>
  );
}
