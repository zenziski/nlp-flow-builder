import { BaseNodeExecutor } from '../base-node.executor';
import { ExecutionResult, ValidationResult } from '../engine.types';
import { resolveVariables } from '../../common/utils/variable-resolver.util';

export class VariableNodeExecutor extends BaseNodeExecutor {
  async validate(): Promise<ValidationResult> {
    const data = this.ctx.currentNode.data as Record<string, unknown>;
    if (!data?.key) return this.validationFail(['VariableNode requires a key']);
    return this.validationOk();
  }

  async execute(): Promise<ExecutionResult> {
    const data = this.ctx.currentNode.data as Record<string, unknown>;
    const action = (data.action as string) ?? 'set';
    const key = data.key as string;
    const rawValue = data.value as string | undefined;
    const value = rawValue !== undefined
      ? resolveVariables(String(rawValue), this.ctx.variables, this.ctx.context)
      : undefined;

    const variableUpdates: Record<string, unknown> = {};
    const current = this.ctx.variables[key];

    switch (action) {
      case 'set':
        variableUpdates[key] = value;
        break;
      case 'unset':
        variableUpdates[key] = undefined;
        break;
      case 'increment':
        variableUpdates[key] = Number(current ?? 0) + Number(value ?? 1);
        break;
      case 'decrement':
        variableUpdates[key] = Number(current ?? 0) - Number(value ?? 1);
        break;
      case 'append':
        variableUpdates[key] = String(current ?? '') + String(value ?? '');
        break;
    }

    const nextNodeId = this.resolveEdge();
    return this.ok([], nextNodeId, { variableUpdates });
  }
}
