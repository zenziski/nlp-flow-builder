import { create } from 'zustand';
import { toast } from 'sonner';
import type { SimulatorMessage, ExecutionLogEntry, ContextSnapshot } from '../types/simulator.types';
import { simulatorSocket } from '../services/simulator.socket';
import { useNodesStore } from './useNodesStore';

interface SimulatorStore {
  sessionId: string | null;
  messages: SimulatorMessage[];
  logs: ExecutionLogEntry[];
  contextSnapshot: ContextSnapshot;
  activeNodeId: string | null;
  isConnected: boolean;
  isTyping: boolean;
  isActive: boolean;
  connectionError: string | null;

  connect: () => void;
  disconnect: () => void;
  startSession: (botId: string, flowId: string) => void;
  sendMessage: (text: string) => void;
  resetSession: (botId: string, flowId: string) => void;
  clearLogs: () => void;
}

export const useSimulatorStore = create<SimulatorStore>((set, get) => ({
  sessionId: null,
  messages: [],
  logs: [],
  contextSnapshot: { variables: {}, context: {} },
  activeNodeId: null,
  isConnected: false,
  isTyping: false,
  isActive: false,
  connectionError: null,

  connect: () => {
    const socket = simulatorSocket.connect();

    socket.on('connect', () => set({ isConnected: true, connectionError: null }));
    socket.on('disconnect', () => set({ isConnected: false, isActive: false }));
    socket.on('connect_error', (err: Error) => {
      set({ connectionError: err.message });
      toast.error('Simulator disconnected — check your connection');
    });

    socket.on('sessionStarted', ({ sessionId }: { sessionId: string }) => {
      set({ sessionId, isActive: true, messages: [], logs: [] });
    });

    socket.on('botMessage', (msg: { content: string; type: string; timestamp: string }) => {
      set({ isTyping: false });
      set((state) => ({
        messages: [
          ...state.messages,
          {
            id: `bot-${Date.now()}-${Math.random()}`,
            role: 'bot',
            content: msg.content,
            type: msg.type as any,
            timestamp: msg.timestamp ?? new Date().toISOString(),
          },
        ],
      }));
    });

    socket.on('botTyping', () => set({ isTyping: true }));

    socket.on('nodeHighlight', ({ nodeId }: { nodeId: string }) => {
      set({ activeNodeId: nodeId });
      useNodesStore.setState((state) => ({
        nodes: state.nodes.map((n) => ({
          ...n,
          data: { ...n.data, _isActive: n.id === nodeId },
        })),
      }));
    });

    socket.on('contextUpdate', ({ variables, context }: ContextSnapshot) => {
      set({ contextSnapshot: { variables, context } });
    });

    socket.on('executionLog', (log: ExecutionLogEntry) => {
      set((state) => ({ logs: [...state.logs, log] }));
    });

    socket.on('sessionEnded', () => {
      set({ isActive: false });
    });

    socket.on('error', ({ message }: { message: string }) => {
      toast.error(`Simulator: ${message}`);
    });
  },

  disconnect: () => {
    simulatorSocket.disconnect();
    set({ isConnected: false, isActive: false, sessionId: null });
  },

  startSession: (botId, flowId) => {
    set({ messages: [], logs: [], activeNodeId: null });
    simulatorSocket.startSession(botId, flowId);
  },

  sendMessage: (text) => {
    const { sessionId } = get();
    if (!sessionId) return;
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: `user-${Date.now()}`,
          role: 'user',
          content: text,
          type: 'text',
          timestamp: new Date().toISOString(),
        },
      ],
      isTyping: true,
    }));
    simulatorSocket.sendMessage(sessionId, text);
  },

  resetSession: (botId, flowId) => {
    const { sessionId } = get();
    if (!sessionId) return;
    set({ messages: [], logs: [], activeNodeId: null });
    simulatorSocket.resetSession(sessionId, botId, flowId);
  },

  clearLogs: () => set({ logs: [] }),
}));
