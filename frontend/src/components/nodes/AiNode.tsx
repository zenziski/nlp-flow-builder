import { memo } from 'react';
import { NodeProps } from 'reactflow';
import { Sparkles } from 'lucide-react';
import BaseNode from './BaseNode';

const PROVIDER_LABELS: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  groq: 'Groq',
  openrouter: 'OpenRouter',
  custom: 'Custom',
};

function AiNode(props: NodeProps) {
  const provider = props.data?.provider as string | undefined;
  const model = props.data?.model as string | undefined;
  const saveResponseAs = props.data?.saveResponseAs as string | undefined;

  return (
    <BaseNode
      {...props}
      icon={<Sparkles className="w-3 h-3 text-white" />}
      title="AI"
      color="bg-purple-600"
      sourceHandles={[
        { id: 'success', label: 'success' },
        { id: 'error', label: 'error' },
      ]}
    >
      <div className="space-y-0.5">
        {provider && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-purple-400">
              {PROVIDER_LABELS[provider] ?? provider}
            </span>
            {model && (
              <span className="text-xs text-slate-400 truncate max-w-[100px]">{model}</span>
            )}
          </div>
        )}
        {saveResponseAs && (
          <p className="text-xs text-slate-500 font-mono">
            → <span className="text-indigo-300">{`{{${saveResponseAs}}}`}</span>
          </p>
        )}
        {!provider && (
          <p className="text-xs text-slate-500 italic">Not configured</p>
        )}
      </div>
      <div className="pb-4" />
    </BaseNode>
  );
}

export default memo(AiNode);
