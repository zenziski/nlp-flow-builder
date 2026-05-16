import { memo } from 'react';
import { NodeProps } from 'reactflow';
import { Globe } from 'lucide-react';
import BaseNode from './BaseNode';

function ApiNode(props: NodeProps) {
  const method = props.data?.method as string ?? 'GET';
  const url = props.data?.url as string ?? '';
  return (
    <BaseNode
      {...props}
      icon={<Globe className="w-3 h-3 text-white" />}
      title="API Call"
      color="bg-emerald-600"
      sourceHandles={[{ id: 'success', label: 'success' }, { id: 'error', label: 'error' }]}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-bold text-emerald-400">{method}</span>
        <span className="text-xs text-slate-400 truncate max-w-[120px]">{url || 'No URL'}</span>
      </div>
      <div className="pb-4" />
    </BaseNode>
  );
}
export default memo(ApiNode);
