import { BaseNodeExecutor } from '../base-node.executor';
import { ExecutionResult, ValidationResult } from '../engine.types';

export class RedirectNodeExecutor extends BaseNodeExecutor {
  async validate(): Promise<ValidationResult> {
    return this.validationOk();
  }

  async execute(): Promise<ExecutionResult> {
    const data = this.ctx.currentNode.data as Record<string, unknown>;
    const targetFlowId = data?.targetFlowId as string | undefined;
    const targetNodeId = data?.targetNodeId as string | undefined;

    if (targetFlowId) {
      return this.ok(
        [{ type: 'redirect', redirectFlowId: targetFlowId, redirectNodeId: targetNodeId }],
        null,
      );
    }

    const nextNodeId = this.resolveEdge();
    return this.ok([], nextNodeId);
  }
}
