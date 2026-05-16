import { memo } from 'react';
import { NodeProps } from 'reactflow';
import { GitBranch } from 'lucide-react';
import BaseNode from './BaseNode';

function ConditionNode(props: NodeProps) {
  const cond = props.data?.condition as any;
  return (
    <BaseNode
      {...props}
      icon={<GitBranch className="w-3 h-3 text-white" />}
      title="Condition"
      color="bg-orange-600"
      sourceHandles={[
        { id: 'yes', label: 'True' },
        { id: 'no', label: 'False' },
      ]}
    >
      {cond && (
        <p className="text-xs text-slate-300 bg-slate-700/50 rounded p-1 font-mono">
          {cond.left} {cond.operator} {String(cond.right ?? '')}
        </p>
      )}
      <div className="pb-4" />
    </BaseNode>
  );
}

export default memo(ConditionNode);
