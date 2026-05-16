import { memo } from 'react';
import { NodeProps } from 'reactflow';
import { Square } from 'lucide-react';
import BaseNode from './BaseNode';

function EndNode(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      icon={<Square className="w-3 h-3 text-white" />}
      title="End"
      color="bg-red-600"
      hideSourceHandle
    >
      {props.data?.message && (
        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{props.data.message as string}</p>
      )}
    </BaseNode>
  );
}

export default memo(EndNode);
