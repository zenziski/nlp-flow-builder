import { NodeSubdoc, EdgeSubdoc, NodeType } from '../modules/flows/schemas/flow.schema';

export interface ConversationTurn {
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  nodeId?: string;
}

export interface ExecutionContext {
  sessionId: string;
  botId: string;
  flowId: string;
  userId: string;
  currentNode: NodeSubdoc;
  nodes: NodeSubdoc[];
  edges: EdgeSubdoc[];
  input?: string;
  variables: Record<string, unknown>;
  context: Record<string, unknown>;
  nlpResult?: NlpResult;
  history: ConversationTurn[];
  logs: ExecutionLog[];
}

export interface NlpResult {
  intent: string;
  score: number;
  entities: Array<{ entity: string; value: string; sourceText: string }>;
  answer?: string;
  utterance: string;
  language: string;
}

export interface ExecutionLog {
  nodeId: string;
  nodeType: NodeType;
  input?: string;
  output?: string;
  timestamp: Date;
  durationMs?: number;
}

export interface BotOutput {
  type: 'text' | 'delay' | 'end' | 'redirect' | 'subflow';
  content?: string;
  delay?: number;
  redirectFlowId?: string;
  redirectNodeId?: string;
  /** Internal signal — never forwarded to the client; consumed by runtime inline expansion */
  subflowId?: string;
}

export interface ExecutionResult {
  nextNodeId: string | null;
  outputs: BotOutput[];
  variableUpdates?: Record<string, unknown>;
  contextUpdates?: Record<string, unknown>;
  waitForInput?: boolean;
  error?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export { NodeType };
