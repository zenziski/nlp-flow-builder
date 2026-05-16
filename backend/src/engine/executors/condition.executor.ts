import { BaseNodeExecutor } from '../base-node.executor';
import { ExecutionResult, ValidationResult } from '../engine.types';
import { evaluateCondition, Condition } from '../../common/utils/condition-evaluator.util';

export class ConditionNodeExecutor extends BaseNodeExecutor {
  async validate(): Promise<ValidationResult> {
    const condition = this.ctx.currentNode.data?.condition as Condition | undefined;
    if (!condition?.left || !condition?.operator) {
      return this.validationFail(['ConditionNode requires a valid condition']);
    }
    return this.validationOk();
  }

  async execute(): Promise<ExecutionResult> {
    const condition = this.ctx.currentNode.data?.condition as Condition;
    const result = evaluateCondition(condition, this.ctx.variables, this.ctx.context);
    const nextNodeId = this.resolveEdge(result ? 'yes' : 'no') ?? this.resolveEdge();
    return this.ok([], nextNodeId);
  }
}
