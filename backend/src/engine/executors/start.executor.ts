import { BaseNodeExecutor } from '../base-node.executor';
import { ExecutionResult, ValidationResult } from '../engine.types';

export class StartNodeExecutor extends BaseNodeExecutor {
  async validate(): Promise<ValidationResult> {
    return this.validationOk();
  }

  async execute(): Promise<ExecutionResult> {
    const nextNodeId = this.resolveEdge('default') ?? this.resolveEdge();
    return this.ok([], nextNodeId);
  }
}
