import { BaseNodeExecutor } from '../base-node.executor';
import { ExecutionResult, ValidationResult } from '../engine.types';
import { resolveVariables } from '../../common/utils/variable-resolver.util';

interface SwitchCase {
  value: string;
  handle: string;
}

export class SwitchNodeExecutor extends BaseNodeExecutor {
  async validate(): Promise<ValidationResult> {
    if (!this.ctx.currentNode.data?.variable) {
      return this.validationFail(['SwitchNode requires a variable to switch on']);
    }
    return this.validationOk();
  }

  async execute(): Promise<ExecutionResult> {
    const data = this.ctx.currentNode.data as Record<string, unknown>;
    const variableExpr = data.variable as string;
    const cases = (data.cases as SwitchCase[]) ?? [];

    const resolved = resolveVariables(variableExpr, this.ctx.variables, this.ctx.context);

    let matchedHandle: string | undefined;
    for (const c of cases) {
      if (String(c.value) === String(resolved)) {
        matchedHandle = c.handle;
        break;
      }
    }

    const nextNodeId =
      this.resolveEdge(matchedHandle ?? 'default') ??
      this.resolveEdge('default') ??
      this.resolveEdge();

    return this.ok([], nextNodeId);
  }
}
