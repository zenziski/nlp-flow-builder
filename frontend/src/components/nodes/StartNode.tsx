import { memo } from 'react';
import { NodeProps, Position } from 'reactflow';
import { Play } from 'lucide-react';
import BaseNode from './BaseNode';

function StartNode(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      icon={<Play className="w-3 h-3 text-white" />}
      title="Start"
      color="bg-green-600"
      targetHandle={false}
    />
  );
}

export default memo(StartNode);
