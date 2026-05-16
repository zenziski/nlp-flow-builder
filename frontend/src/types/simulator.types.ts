export interface SimulatorMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
  type?: 'text' | 'delay' | 'end';
  timestamp: string;
}

export interface ExecutionLogEntry {
  nodeId: string;
  nodeType: string;
  input?: string;
  output?: string;
  timestamp: string;
  durationMs?: number;
}

export interface ContextSnapshot {
  variables: Record<string, unknown>;
  context: Record<string, unknown>;
}
