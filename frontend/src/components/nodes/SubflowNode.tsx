import { memo } from 'react';
import { NodeProps } from 'reactflow';
import { Layers } from 'lucide-react';
import BaseNode from './BaseNode';

function SubflowNode(props: NodeProps) {
  const name = props.data?.subflowName as string | undefined;

  return (
    <BaseNode
      {...props}
      icon={<Layers className="w-3 h-3 text-white" />}
      title="Sub-flow"
      color="bg-indigo-600"
    >
      <p className="text-xs text-slate-400 truncate max-w-[160px]">
        {name ?? <span className="italic">No flow selected</span>}
      </p>
    </BaseNode>
  );
}

export default memo(SubflowNode);
