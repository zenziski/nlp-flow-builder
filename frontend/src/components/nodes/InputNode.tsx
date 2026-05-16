import { memo } from 'react';
import { NodeProps } from 'reactflow';
import { TextCursor } from 'lucide-react';
import BaseNode from './BaseNode';

function InputNode(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      icon={<TextCursor className="w-3 h-3 text-white" />}
      title="User Input"
      color="bg-cyan-600"
    >
      {props.data?.prompt && (
        <p className="text-xs text-slate-400 line-clamp-1">{props.data.prompt as string}</p>
      )}
      {props.data?.saveAs && (
        <p className="text-xs text-slate-500 mt-0.5">→ <code className="text-indigo-300">{'{{'}{props.data.saveAs as string}{'}}'}</code></p>
      )}
    </BaseNode>
  );
}

export default memo(InputNode);
