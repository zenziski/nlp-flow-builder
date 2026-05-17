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
import { Check, Pencil, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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
  const { selectedNodeId, nodes, selectNode, renameNode, updateNodeData } = useNodesStore();
  const node = nodes.find((n) => n.id === selectedNodeId);
  const [width, setWidth] = useState(280);
  const widthRef = useRef(280);

  // ── Editable node ID ───────────────────────────────────────────────────
  const [editingId, setEditingId] = useState(false);
  const [idDraft, setIdDraft] = useState('');
  const [idError, setIdError] = useState('');
  const idInputRef = useRef<HTMLInputElement>(null);

  // ── Editable label ─────────────────────────────────────────────────────
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelDraft, setLabelDraft] = useState('');
  const labelInputRef = useRef<HTMLInputElement>(null);

  // Reset editing state when the selected node changes
  useEffect(() => {
    setEditingId(false);
    setIdError('');
    setEditingLabel(false);
  }, [selectedNodeId]);

  const startEditId = () => {
    setIdDraft(node!.id);
    setIdError('');
    setEditingId(true);
    setTimeout(() => idInputRef.current?.select(), 0);
  };

  const cancelEditId = () => {
    setEditingId(false);
    setIdError('');
  };

  const commitEditId = () => {
    const trimmed = idDraft.trim();
    if (!trimmed) { setIdError('ID cannot be empty'); return; }
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      setIdError('Only letters, numbers, - and _ allowed');
      return;
    }
    if (trimmed !== node!.id && nodes.some((n) => n.id === trimmed)) {
      setIdError('ID already in use');
      return;
    }
    renameNode(node!.id, trimmed);
    setEditingId(false);
    setIdError('');
  };

  const handleIdKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitEditId();
    if (e.key === 'Escape') cancelEditId();
  };

  // ── Label handlers ─────────────────────────────────────────────────────
  const startEditLabel = () => {
    setLabelDraft(node!.data?.label ?? '');
    setEditingLabel(true);
    setTimeout(() => { labelInputRef.current?.select(); }, 0);
  };

  const commitEditLabel = () => {
    const trimmed = labelDraft.trim();
    if (trimmed) updateNodeData(node!.id, { label: trimmed });
    setEditingLabel(false);
  };

  const handleLabelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitEditLabel();
    if (e.key === 'Escape') setEditingLabel(false);
  };

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
      <div className="p-3 border-b border-[#e8d4c8] flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0 space-y-0.5">
          {/* Label — editable title */}
          {editingLabel ? (
            <input
              ref={labelInputRef}
              value={labelDraft}
              onChange={(e) => setLabelDraft(e.target.value)}
              onKeyDown={handleLabelKeyDown}
              onBlur={commitEditLabel}
              className="w-full px-1.5 py-0.5 rounded bg-[#f5ede8] border border-[#d4a574] text-sm font-semibold text-[#5f4340] focus:outline-none focus:ring-1 focus:ring-[#f07a3a]"
            />
          ) : (
            <div className="flex items-center gap-1 group cursor-text" onClick={startEditLabel}>
              <p className="text-sm font-semibold text-[#5f4340] truncate">
                {node.data?.label || <span className="italic text-[#9a7c6d]">Unnamed</span>}
              </p>
              <Pencil className="w-2.5 h-2.5 text-[#9a7c6d] opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity" />
            </div>
          )}

          {/* Node type — static */}
          <p className="text-[10px] text-[#b89080]">{node.type}</p>

          {/* Node ID — editable */}
          {editingId ? (
            <div>
              <div className="flex items-center gap-1">
                <input
                  ref={idInputRef}
                  value={idDraft}
                  onChange={(e) => { setIdDraft(e.target.value); setIdError(''); }}
                  onKeyDown={handleIdKeyDown}
                  className="flex-1 min-w-0 px-1.5 py-0.5 rounded bg-[#f5ede8] border border-[#d4a574] text-[10px] font-mono text-[#5f4340] focus:outline-none focus:ring-1 focus:ring-[#f07a3a]"
                />
                <button onClick={commitEditId} className="text-green-600 hover:text-green-700 flex-shrink-0">
                  <Check className="w-3 h-3" />
                </button>
                <button onClick={cancelEditId} className="text-[#9a7c6d] hover:text-[#5f4340] flex-shrink-0">
                  <X className="w-3 h-3" />
                </button>
              </div>
              {idError && <p className="text-[9px] text-red-500 mt-0.5">{idError}</p>}
            </div>
          ) : (
            <div className="flex items-center gap-1 group">
              <p className="text-[10px] text-[#9a7c6d] font-mono truncate">{node.id}</p>
              <button
                onClick={startEditId}
                className="opacity-0 group-hover:opacity-100 text-[#9a7c6d] hover:text-[#5f4340] flex-shrink-0 transition-opacity"
                title="Rename node ID"
              >
                <Pencil className="w-2.5 h-2.5" />
              </button>
            </div>
          )}
        </div>
        <button onClick={() => selectNode(null)} className="text-[#9a7c6d] hover:text-[#5f4340] flex-shrink-0 mt-0.5">
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
