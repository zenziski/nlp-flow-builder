import { BaseNodeExecutor } from '../base-node.executor';
import { BotOutput, ExecutionResult, ValidationResult } from '../engine.types';

export class EndNodeExecutor extends BaseNodeExecutor {
  async validate(): Promise<ValidationResult> {
    return this.validationOk();
  }

  async execute(): Promise<ExecutionResult> {
    const message = this.ctx.currentNode.data?.message as string | undefined;
    const outputs: BotOutput[] = message
      ? [{ type: 'text', content: this.resolveText(message) }]
      : [];
    outputs.push({ type: 'end' });
    return this.ok(outputs, null);
  }
}
