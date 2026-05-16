import { memo } from 'react';
import { NodeProps } from 'reactflow';
import { Variable } from 'lucide-react';
import BaseNode from './BaseNode';

function VariableNode(props: NodeProps) {
  const action = props.data?.action as string ?? 'set';
  const key = props.data?.key as string ?? '';
  const value = props.data?.value as string ?? '';
  return (
    <BaseNode {...props} icon={<Variable className="w-3 h-3 text-white" />} title="Variable" color="bg-pink-600">
      <p className="text-xs text-slate-300 font-mono">
        <span className="text-slate-500">{action}</span> {key} = {value}
      </p>
    </BaseNode>
  );
}
export default memo(VariableNode);
