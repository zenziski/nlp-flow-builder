import { memo } from 'react';
import { NodeProps } from 'reactflow';
import { Dices } from 'lucide-react';
import BaseNode from './BaseNode';

function RandomNode(props: NodeProps) {
  return (
    <BaseNode {...props} icon={<Dices className="w-3 h-3 text-white" />} title="Random" color="bg-amber-600">
      <p className="text-xs text-slate-400">Random path selection</p>
    </BaseNode>
  );
}
export default memo(RandomNode);
