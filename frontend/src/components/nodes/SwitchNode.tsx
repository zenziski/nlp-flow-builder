import { memo } from 'react';
import { NodeProps } from 'reactflow';
import { ToggleLeft } from 'lucide-react';
import BaseNode from './BaseNode';

function SwitchNode(props: NodeProps) {
  const cases = (props.data?.cases as Array<{ value: string; handle: string }>) ?? [];
  const handles = [
    ...cases.map((c) => ({ id: c.handle, label: c.value })),
    { id: 'default', label: 'default' },
  ];
  return (
    <BaseNode
      {...props}
      icon={<ToggleLeft className="w-3 h-3 text-white" />}
      title="Switch"
      color="bg-yellow-600"
      sourceHandles={handles}
    >
      <p className="text-xs text-slate-400 font-mono">{props.data?.variable as string ?? 'no variable'}</p>
      <div className="pb-4" />
    </BaseNode>
  );
}

export default memo(SwitchNode);
