import { useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlowProvider,
  ReactFlowInstance,
  NodeChange,
  EdgeChange,
  Connection,
  Edge,
  updateEdge,
} from 'reactflow';
import { v4 as uuid } from 'uuid';
import { useNodesStore } from '../../stores/useNodesStore';
import { useFlowStore } from '../../stores/useFlowStore';
import { nodeTypes } from '../nodes';
import DeletableEdge from '../nodes/DeleteableEdge';
import type { FlowNode } from '../../types/flow.types';

const edgeTypes = { default: DeletableEdge };

function FlowCanvasInner() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, pushToUndo, selectNode, setEdges } =
    useNodesStore();
  const { markDirty } = useFlowStore();
  const rfInstanceRef = useRef<ReactFlowInstance | null>(null);
  const edgeUpdateSuccessful = useRef(false);

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const meaningful = changes.some((c) => c.type !== 'select' && c.type !== 'dimensions');
      if (meaningful) markDirty();
      onNodesChange(changes);
    },
    [onNodesChange, markDirty],
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      markDirty();
      onEdgesChange(changes);
    },
    [onEdgesChange, markDirty],
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      markDirty();
      onConnect(connection);
    },
    [onConnect, markDirty],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const nodeType = event.dataTransfer.getData('nodeType');
      if (!nodeType || !rfInstanceRef.current) return;

      const position = rfInstanceRef.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      pushToUndo();
      const newNode: FlowNode = {
        id: uuid(),
        type: nodeType as any,
        position,
        data: { label: nodeType.replace('Node', ''), messages: nodeType === 'messageNode' ? [''] : undefined } as any,
      };
      addNode(newNode);
      markDirty();
    },
    [addNode, markDirty, pushToUndo],
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: FlowNode) => {
      selectNode(node.id);
    },
    [selectNode],
  );

  const handlePaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  const handleEdgeUpdateStart = useCallback(() => {
    edgeUpdateSuccessful.current = false;
  }, []);

  const handleEdgeUpdate = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      edgeUpdateSuccessful.current = true;
      setEdges(updateEdge(oldEdge, newConnection, edges));
      markDirty();
    },
    [edges, setEdges, markDirty],
  );

  const handleEdgeUpdateEnd = useCallback(
    (_: MouseEvent | TouchEvent, edge: Edge) => {
      if (!edgeUpdateSuccessful.current) {
        setEdges(edges.filter((e) => e.id !== edge.id));
        markDirty();
      }
      edgeUpdateSuccessful.current = false;
    },
    [edges, setEdges, markDirty],
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={handleNodesChange}
      onEdgesChange={handleEdgesChange}
      onConnect={handleConnect}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onNodeClick={handleNodeClick}
      onPaneClick={handlePaneClick}
      onEdgeUpdateStart={handleEdgeUpdateStart}
      onEdgeUpdate={handleEdgeUpdate}
      onEdgeUpdateEnd={handleEdgeUpdateEnd}
      onInit={(instance) => { rfInstanceRef.current = instance; }}
      fitView
      deleteKeyCode="Delete"
      className="flow-editor-shell"
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#ddb9a4" />
      <Controls className="fill-[#8e6959]" />
      <MiniMap
        nodeColor={(node) => {
          const colors: Record<string, string> = {
            startNode: '#0f766e',
            endNode: '#b9382f',
            messageNode: '#ef6c3e',
            inputNode: '#9a6f5a',
            intentNode: '#8f4e74',
            conditionNode: '#d35a2f',
            switchNode: '#b0823f',
            apiNode: '#3f8d88',
            variableNode: '#ba5f88',
          };
          return colors[node.type ?? ''] ?? '#9a7869';
        }}
        maskColor="rgba(234, 214, 201, 0.78)"
        className="!bg-[#fffdfb] !border-[#e5d1c5]"
      />
    </ReactFlow>
  );
}

export default function FlowCanvas() {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner />
    </ReactFlowProvider>
  );
}
