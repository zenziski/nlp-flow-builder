import { create } from 'zustand';
import type { Flow, FlowValidationResult } from '../types/flow.types';
import { flowsService } from '../services/flows.service';
import { useNodesStore } from './useNodesStore';

interface FlowStore {
  flows: Flow[];
  activeFlowId: string | null;
  activeFlow: Flow | null;
  isDirty: boolean;
  isSaving: boolean;
  validationResult: FlowValidationResult | null;
  isLoading: boolean;
  fetchFlows: (botId: string) => Promise<void>;
  setActiveFlow: (flow: Flow) => void;
  saveCanvas: () => Promise<void>;
  publishFlow: () => Promise<void>;
  validateFlow: () => Promise<FlowValidationResult>;
  exportFlow: () => Promise<void>;
  markDirty: () => void;
  createFlow: (name: string, botId: string) => Promise<Flow>;
  deleteFlow: (id: string) => Promise<void>;
  updateFlowMeta: (id: string, data: { name?: string; description?: string }) => Promise<void>;
}

export const useFlowStore = create<FlowStore>((set, get) => ({
  flows: [],
  activeFlowId: null,
  activeFlow: null,
  isDirty: false,
  isSaving: false,
  validationResult: null,
  isLoading: false,

  fetchFlows: async (botId) => {
    set({ isLoading: true });
    try {
      const flows = await flowsService.findAll(botId);
      set({ flows });
    } finally {
      set({ isLoading: false });
    }
  },

  setActiveFlow: (flow) => {
    useNodesStore.getState().setNodesAndEdges(flow.nodes ?? [], flow.edges ?? []);
    set({ activeFlow: flow, activeFlowId: flow._id, isDirty: false });
  },

  saveCanvas: async () => {
    const { activeFlowId, activeFlow } = get();
    if (!activeFlowId) return;
    set({ isSaving: true });
    try {
      const { nodes, edges } = useNodesStore.getState();
      const startNode = nodes.find((n) => n.type === 'startNode');
      const updated = await flowsService.saveCanvas(activeFlowId, {
        nodes,
        edges,
        startNodeId: startNode?.id ?? activeFlow?.startNodeId,
      });
      set({ activeFlow: updated, isDirty: false });
    } catch (err) {
      set({ isSaving: false });
      throw err;
    }
    set({ isSaving: false });
  },

  publishFlow: async () => {
    const { activeFlowId } = get();
    if (!activeFlowId) return;
    try {
      const updated = await flowsService.publish(activeFlowId);
      set((state) => ({
        activeFlow: updated,
        flows: state.flows.map((f) => (f._id === activeFlowId ? updated : f)),
      }));
    } catch (err) {
      throw err;
    }
  },

  validateFlow: async () => {
    const { activeFlowId } = get();
    if (!activeFlowId) return { valid: false, errors: [] };
    const result = await flowsService.validate(activeFlowId);
    set({ validationResult: result });
    return result;
  },

  exportFlow: async () => {
    const { activeFlowId } = get();
    if (!activeFlowId) return;
    const data = await flowsService.exportJson(activeFlowId);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flow-${activeFlowId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  markDirty: () => set({ isDirty: true }),

  createFlow: async (name, botId) => {
    const flow = await flowsService.create({ name, botId });
    set((state) => ({ flows: [flow, ...state.flows] }));
    return flow;
  },

  deleteFlow: async (id) => {
    await flowsService.remove(id);
    set((state) => ({
      flows: state.flows.filter((f) => f._id !== id),
      activeFlowId: state.activeFlowId === id ? null : state.activeFlowId,
      activeFlow: state.activeFlowId === id ? null : state.activeFlow,
    }));
  },

  updateFlowMeta: async (id, data) => {
    const updated = await flowsService.update(id, data);
    set((state) => ({
      flows: state.flows.map((f) => (f._id === id ? updated : f)),
      activeFlow: state.activeFlowId === id ? updated : state.activeFlow,
    }));
  },
}));
