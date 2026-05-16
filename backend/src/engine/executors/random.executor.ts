import { BaseNodeExecutor } from '../base-node.executor';
import { ExecutionResult, ValidationResult } from '../engine.types';
import { EdgeSubdoc } from '../../modules/flows/schemas/flow.schema';

export class RandomNodeExecutor extends BaseNodeExecutor {
  async validate(): Promise<ValidationResult> {
    return this.validationOk();
  }

  async execute(): Promise<ExecutionResult> {
    const outgoing = this.ctx.edges.filter(
      (e: EdgeSubdoc) => e.source === this.ctx.currentNode.id,
    );

    if (outgoing.length === 0) {
      return this.ok([], null);
    }

    const weights = outgoing.map((e: EdgeSubdoc) => {
      const data = this.ctx.currentNode.data as Record<string, unknown>;
      const handleWeights = data?.weights as Record<string, number> | undefined;
      return handleWeights?.[e.sourceHandle ?? 'default'] ?? 1;
    });

    const total = weights.reduce((sum: number, w: number) => sum + w, 0);
    let rand = Math.random() * total;
    let picked = outgoing[outgoing.length - 1];
    for (let i = 0; i < outgoing.length; i++) {
      rand -= weights[i];
      if (rand <= 0) { picked = outgoing[i]; break; }
    }

    return this.ok([], picked.target);
  }
}
