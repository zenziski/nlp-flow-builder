import { useNodesStore } from '../../stores/useNodesStore';
import MessageNodeForm from './forms/MessageNodeForm';
import InputNodeForm from './forms/InputNodeForm';
import IntentNodeForm from './forms/IntentNodeForm';
import ConditionNodeForm from './forms/ConditionNodeForm';
import VariableNodeForm from './forms/VariableNodeForm';
import ApiNodeForm from './forms/ApiNodeForm';
import DelayNodeForm from './forms/DelayNodeForm';
import SwitchNodeForm from './forms/SwitchNodeForm';
import SubflowNodeForm from './forms/SubflowNodeForm';
import { X } from 'lucide-react';
import { useState, useRef } from 'react';

const formMap: Record<string, React.FC<{ nodeId: string; data: any }>> = {
  messageNode: MessageNodeForm,
  inputNode: InputNodeForm,
  intentNode: IntentNodeForm,
  conditionNode: ConditionNodeForm,
  variableNode: VariableNodeForm,
  apiNode: ApiNodeForm,
  delayNode: DelayNodeForm,
  switchNode: SwitchNodeForm,
  subflowNode: SubflowNodeForm,
};

export default function PropertiesPanel() {
  const { selectedNodeId, nodes, selectNode } = useNodesStore();
  const node = nodes.find((n) => n.id === selectedNodeId);
  const [width, setWidth] = useState(280);
  const widthRef = useRef(280);

  // Capture start position and start width on mousedown to avoid stale closures
  const handleDragHandleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = widthRef.current;

    const onMove = (ev: MouseEvent) => {
      // Panel is on the right side; dragging the left edge leftward increases width
      const newWidth = Math.max(220, Math.min(720, startWidth - (ev.clientX - startX)));
      widthRef.current = newWidth;
      setWidth(newWidth);
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const DragHandle = (
    <div
      onMouseDown={handleDragHandleMouseDown}
      className="absolute left-0 top-0 h-full w-1.5 cursor-ew-resize hover:bg-[#f07a3a]/40 transition-colors z-10"
      title="Drag to resize"
    />
  );

  if (!node) {
    return (
      <div
        className="flow-editor-pane flow-editor-properties border-l flex-shrink-0 flex items-center justify-center relative"
        style={{ width }}
      >
        {DragHandle}
        <p className="text-[#9a7c6d] text-xs text-center px-4">Select a node to edit its properties</p>
      </div>
    );
  }

  const Form = formMap[node.type ?? ''];

  return (
    <div
      className="flow-editor-pane flow-editor-properties border-l flex-shrink-0 overflow-y-auto relative"
      style={{ width }}
    >
      {DragHandle}
      <div className="p-3 border-b border-[#e8d4c8] flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-[#5f4340]">{node.type}</p>
          <p className="text-xs text-[#9a7c6d] font-mono">{node.id.slice(0, 12)}…</p>
        </div>
        <button onClick={() => selectNode(null)} className="text-[#9a7c6d] hover:text-[#5f4340]">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="p-3">
        {Form ? (
          <Form nodeId={node.id} data={node.data} />
        ) : (
          <p className="text-xs text-[#9a7c6d]">No configuration for this node type.</p>
        )}
      </div>
    </div>
  );
}
