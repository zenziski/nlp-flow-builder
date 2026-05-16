import { BaseNodeExecutor } from '../base-node.executor';
import { ExecutionResult, ValidationResult } from '../engine.types';

export class MessageNodeExecutor extends BaseNodeExecutor {
  async validate(): Promise<ValidationResult> {
    const messages = this.ctx.currentNode.data?.messages as string[] | undefined;
    if (!messages || messages.length === 0) {
      return this.validationFail(['MessageNode requires at least one message']);
    }
    return this.validationOk();
  }

  async execute(): Promise<ExecutionResult> {
    const messages = (this.ctx.currentNode.data?.messages as string[]) ?? [];
    const outputs = messages.map((m) => ({
      type: 'text' as const,
      content: this.resolveText(m),
    }));
    const nextNodeId = this.resolveEdge();
    return this.ok(outputs, nextNodeId);
  }
}
