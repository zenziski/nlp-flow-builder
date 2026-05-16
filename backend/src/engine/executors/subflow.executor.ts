import { BaseNodeExecutor } from '../base-node.executor';
import { ExecutionResult, ValidationResult } from '../engine.types';

export class SubflowNodeExecutor extends BaseNodeExecutor {
  async validate(): Promise<ValidationResult> {
    const data = this.ctx.currentNode.data as Record<string, unknown>;
    if (!data?.subflowId) {
      return this.validationFail(['subflowNode requires a subflowId']);
    }
    return this.validationOk();
  }

  async execute(): Promise<ExecutionResult> {
    const data = this.ctx.currentNode.data as Record<string, unknown>;
    const subflowId = data?.subflowId as string | undefined;

    if (!subflowId) {
      // Mis-configured — skip and continue
      const nextNodeId = this.resolveEdge();
      return this.ok([], nextNodeId);
    }

    // Emit an internal 'subflow' signal; the runtime loop expands it inline
    // and then advances to the next node connected after this subflowNode.
    return this.ok([{ type: 'subflow', subflowId }], null);
  }
}
