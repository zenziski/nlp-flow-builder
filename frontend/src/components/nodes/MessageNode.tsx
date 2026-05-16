import { memo } from 'react';
import { NodeProps } from 'reactflow';
import { MessageSquare } from 'lucide-react';
import BaseNode from './BaseNode';

function MessageNode(props: NodeProps) {
  const messages = (props.data?.messages as string[]) ?? [];
  return (
    <BaseNode
      {...props}
      icon={<MessageSquare className="w-3 h-3 text-white" />}
      title="Message"
      color="bg-blue-600"
    >
      {messages.length > 0 && (
        <p className="text-xs text-slate-300 bg-slate-700/50 rounded p-1.5 line-clamp-2">
          {messages[0]}
          {messages.length > 1 && <span className="text-slate-500"> +{messages.length - 1}</span>}
        </p>
      )}
    </BaseNode>
  );
}

export default memo(MessageNode);
