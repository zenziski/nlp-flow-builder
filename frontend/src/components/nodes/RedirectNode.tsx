import { memo } from 'react';
import { NodeProps } from 'reactflow';
import { CornerRightDown } from 'lucide-react';
import BaseNode from './BaseNode';

function RedirectNode(props: NodeProps) {
  return (
    <BaseNode {...props} icon={<CornerRightDown className="w-3 h-3 text-white" />} title="Redirect" color="bg-teal-600" hideSourceHandle>
      <p className="text-xs text-slate-400">{props.data?.targetFlowId ? 'Redirect to flow' : 'No target set'}</p>
    </BaseNode>
  );
}
export default memo(RedirectNode);
