import { BaseNodeExecutor } from '../base-node.executor';
import { ExecutionResult, ValidationResult } from '../engine.types';

export class DelayNodeExecutor extends BaseNodeExecutor {
  async validate(): Promise<ValidationResult> {
    return this.validationOk();
  }

  async execute(): Promise<ExecutionResult> {
    const delayMs = (this.ctx.currentNode.data?.delayMs as number) ?? 1000;
    const nextNodeId = this.resolveEdge();
    return this.ok([{ type: 'delay', delay: delayMs }], nextNodeId);
  }
}
