import type { Node, Edge } from 'reactflow';

export type NodeType =
  | 'startNode'
  | 'endNode'
  | 'messageNode'
  | 'inputNode'
  | 'intentNode'
  | 'conditionNode'
  | 'switchNode'
  | 'delayNode'
  | 'aiNode'
  | 'apiNode'
  | 'variableNode'
  | 'redirectNode'
  | 'randomNode'
  | 'subflowNode';

export interface FlowNodeData {
  label: string;
  [key: string]: unknown;
}

export type FlowNode = Node<FlowNodeData, NodeType>;
export type FlowEdge = Edge;

export interface Flow {
  _id: string;
  name: string;
  botId: string;
  description?: string;
  startNodeId?: string;
  version: number;
  published: boolean;
  isDefault: boolean;
  nodes: FlowNode[];
  edges: FlowEdge[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateFlowDto {
  name: string;
  botId: string;
  description?: string;
}

export interface SaveCanvasDto {
  nodes: FlowNode[];
  edges: FlowEdge[];
  startNodeId?: string;
}

export interface FlowValidationResult {
  valid: boolean;
  errors: Array<{
    nodeId?: string;
    type: 'error' | 'warning';
    message: string;
  }>;
}
