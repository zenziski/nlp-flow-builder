import { useState } from 'react';
import { useNodesStore } from '../../../stores/useNodesStore';
import Input from '../../ui/Input';

interface Props { nodeId: string; data: any; }

export default function InputNodeForm({ nodeId, data }: Props) {
  const { updateNodeData } = useNodesStore();
  const [prompt, setPrompt] = useState(data.prompt ?? '');
  const [saveAs, setSaveAs] = useState(data.saveAs ?? '');

  const commit = (field: string, val: string) => {
    updateNodeData(nodeId, { [field]: val });
  };

  return (
    <div className="space-y-3">
      <div>
        <Input
          label="Prompt message (optional)"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onBlur={() => commit('prompt', prompt)}
          placeholder="What is your name?"
        />
      </div>
      <div>
        <Input
          label="Save to variable"
          value={saveAs}
          onChange={(e) => setSaveAs(e.target.value)}
          onBlur={() => commit('saveAs', saveAs)}
          placeholder="e.g. user.name"
        />
        {saveAs && <p className="text-xs text-slate-500 mt-0.5">Accessible as {'{{' + saveAs + '}}'}</p>}
      </div>
    </div>
  );
}
