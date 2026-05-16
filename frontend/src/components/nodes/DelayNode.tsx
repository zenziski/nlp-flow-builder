import { memo } from 'react';
import { NodeProps } from 'reactflow';
import { Timer } from 'lucide-react';
import BaseNode from './BaseNode';

function DelayNode(props: NodeProps) {
  const ms = props.data?.delayMs as number ?? 1000;
  return (
    <BaseNode {...props} icon={<Timer className="w-3 h-3 text-white" />} title="Delay" color="bg-slate-600">
      <p className="text-xs text-slate-400">{ms >= 1000 ? `${ms / 1000}s` : `${ms}ms`}</p>
    </BaseNode>
  );
}
export default memo(DelayNode);
