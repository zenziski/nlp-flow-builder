import { BaseNodeExecutor } from '../base-node.executor';
import { ExecutionResult, ValidationResult } from '../engine.types';

export class InputNodeExecutor extends BaseNodeExecutor {
  async validate(): Promise<ValidationResult> {
    return this.validationOk();
  }

  async execute(): Promise<ExecutionResult> {
    const data = this.ctx.currentNode.data as Record<string, unknown>;

    if (this.ctx.input === undefined || this.ctx.input === null) {
      const prompt = data?.prompt as string | undefined;
      const outputs = prompt
        ? [{ type: 'text' as const, content: this.resolveText(prompt) }]
        : [];
      return this.ok(outputs, null, { waitForInput: true });
    }

    const saveAs = data?.saveAs as string | undefined;
    const variableUpdates: Record<string, unknown> = {};
    if (saveAs) {
      variableUpdates[saveAs] = this.ctx.input;
    }

    const nextNodeId = this.resolveEdge();
    return this.ok([], nextNodeId, { variableUpdates });
  }
}
