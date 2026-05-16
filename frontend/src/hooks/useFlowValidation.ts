import { useMemo } from 'react';
import { useNodesStore } from '../stores/useNodesStore';
import type { FlowNode, FlowEdge } from '../types/flow.types';

export interface ValidationError {
  nodeId?: string;
  type: 'error' | 'warning';
  message: string;
}

function validate(nodes: FlowNode[], edges: FlowEdge[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const startNodes = nodes.filter((n) => n.type === 'startNode');

  if (startNodes.length === 0) errors.push({ type: 'error', message: 'Flow has no Start node' });
  if (startNodes.length > 1) errors.push({ type: 'error', message: 'Flow has multiple Start nodes' });

  const nodeIds = new Set(nodes.map((n) => n.id));
  for (const edge of edges) {
    if (!nodeIds.has(edge.source)) errors.push({ type: 'error', message: `Edge has invalid source: ${edge.source}` });
    if (!nodeIds.has(edge.target)) errors.push({ type: 'error', message: `Edge has invalid target: ${edge.target}` });
  }

  for (const node of nodes) {
    if (node.type === 'endNode' || node.type === 'redirectNode') continue;
    const hasOutgoing = edges.some((e) => e.source === node.id);
    if (!hasOutgoing) {
      errors.push({ nodeId: node.id, type: 'error', message: `"${node.data?.label ?? node.type}" has no outgoing connection` });
    }
  }

  for (const node of nodes) {
    if (node.type === 'startNode') continue;
    const hasIncoming = edges.some((e) => e.target === node.id);
    if (!hasIncoming) {
      errors.push({ nodeId: node.id, type: 'warning', message: `"${node.data?.label ?? node.type}" is unreachable` });
    }
  }

  return errors;
}

export function useFlowValidation() {
  const { nodes, edges } = useNodesStore();
  return useMemo(() => validate(nodes, edges), [nodes, edges]);
}
