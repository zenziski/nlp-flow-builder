import { create } from 'zustand';
import type { FlowNode, FlowEdge } from '../types/flow.types';
import type { NodeChange, EdgeChange, Connection } from 'reactflow';
import { applyNodeChanges, applyEdgeChanges, addEdge } from 'reactflow';

const MAX_UNDO = 50;

interface NodesStore {
  nodes: FlowNode[];
  edges: FlowEdge[];
  selectedNodeId: string | null;
  undoStack: Array<{ nodes: FlowNode[]; edges: FlowEdge[] }>;
  redoStack: Array<{ nodes: FlowNode[]; edges: FlowEdge[] }>;

  setNodes: (nodes: FlowNode[]) => void;
  setEdges: (edges: FlowEdge[]) => void;
  setNodesAndEdges: (nodes: FlowNode[], edges: FlowEdge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (node: FlowNode) => void;
  updateNodeData: (nodeId: string, data: Partial<FlowNode['data']>) => void;
  selectNode: (nodeId: string | null) => void;
  undo: () => void;
  redo: () => void;
  pushToUndo: () => void;
}

export const useNodesStore = create<NodesStore>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  undoStack: [],
  redoStack: [],

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  setNodesAndEdges: (nodes, edges) => set({ nodes, edges, undoStack: [], redoStack: [] }),

  onNodesChange: (changes) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes) as FlowNode[],
    }));
  },

  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges) as FlowEdge[],
    }));
  },

  onConnect: (connection) => {
    get().pushToUndo();
    set((state) => ({
      edges: addEdge({ ...connection, animated: true, type: 'default' }, state.edges) as FlowEdge[],
    }));
  },

  addNode: (node) => {
    get().pushToUndo();
    set((state) => ({ nodes: [...state.nodes, node] }));
  },

  updateNodeData: (nodeId, data) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n,
      ),
    }));
    // Lazily mark the flow dirty so auto-save picks up node data edits.
    // Dynamic import breaks the circular-dependency cycle at module-init time.
    import('./useFlowStore').then(({ useFlowStore }) => {
      useFlowStore.getState().markDirty();
    });
  },

  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

  pushToUndo: () => {
    const { nodes, edges, undoStack } = get();
    const newStack = [...undoStack, { nodes: [...nodes], edges: [...edges] }];
    if (newStack.length > MAX_UNDO) newStack.shift();
    set({ undoStack: newStack, redoStack: [] });
  },

  undo: () => {
    const { undoStack, nodes, edges } = get();
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    set((state) => ({
      nodes: prev.nodes,
      edges: prev.edges,
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, { nodes, edges }],
    }));
  },

  redo: () => {
    const { redoStack, nodes, edges } = get();
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    set((state) => ({
      nodes: next.nodes,
      edges: next.edges,
      redoStack: state.redoStack.slice(0, -1),
      undoStack: [...state.undoStack, { nodes, edges }],
    }));
  },
}));
