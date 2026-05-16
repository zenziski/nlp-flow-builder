import { memo } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { Brain } from 'lucide-react';
import BaseNode from './BaseNode';

// These must match BaseNode's layout exactly so handles align with rows:
//   p-3 top(12) + header h-6(24) + collapsed mb-1/mt-1(4) + subtitle text-xs(16) + mb-1.5(6) = 62px
const CONTENT_TOP = 62;
const ROW_H = 28; // each intent row height in px

function IntentNode(props: NodeProps) {
  const intents = (props.data?.intents as string[]) ?? [];
  const allOutputs = [...intents, 'fallback'];

  return (
    <BaseNode
      {...props}
      icon={<Brain className="w-3 h-3 text-white" />}
      title="Intent"
      color="bg-violet-600"
      hideSourceHandle
    >
      <p className="text-xs text-slate-400 mb-1.5">
        {intents.length > 0
          ? `${intents.length} intent${intents.length !== 1 ? 's' : ''}`
          : 'No intents configured'}
      </p>

      {/* Fixed-height rows — each row center aligns with its right-side handle */}
      <div className="pr-3">
        {allOutputs.map((name, idx) => (
          <div
            key={name}
            style={{ height: ROW_H }}
            className="flex items-center gap-1.5"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                name === 'fallback' ? 'bg-slate-400' : 'bg-violet-400'
              }`}
            />
            <span
              className={`text-xs truncate max-w-[140px] ${
                name === 'fallback' ? 'text-slate-400 italic' : 'text-slate-500'
              }`}
            >
              {name}
            </span>

            {/* Absolutely positioned relative to BaseNode's outer div */}
            <Handle
              type="source"
              position={Position.Right}
              id={name}
              className="!w-3 !h-3 !bg-[#ef6c3e] !border-2 !border-[#e4cec1]"
              style={{
                top: CONTENT_TOP + idx * ROW_H + ROW_H / 2,
                right: 0,
                transform: 'translate(50%, -50%)',
              }}
            />
          </div>
        ))}
      </div>
    </BaseNode>
  );
}

export default memo(IntentNode);
