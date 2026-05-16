import {
  ExecutionContext,
  ExecutionResult,
  ValidationResult,
} from './engine.types';
import { EdgeSubdoc } from '../modules/flows/schemas/flow.schema';
import { resolveVariables } from '../common/utils/variable-resolver.util';

export abstract class BaseNodeExecutor {
  constructor(protected readonly ctx: ExecutionContext) {}

  abstract validate(): Promise<ValidationResult>;
  abstract execute(): Promise<ExecutionResult>;

  protected resolveEdge(handle?: string): string | null {
    const { edges, currentNode } = this.ctx;
    let edge: EdgeSubdoc | undefined;

    if (handle) {
      edge = edges.find(
        (e) => e.source === currentNode.id && e.sourceHandle === handle,
      );
    }
    if (!edge) {
      edge = edges.find((e) => e.source === currentNode.id && !e.sourceHandle);
    }
    if (!edge) {
      edge = edges.find((e) => e.source === currentNode.id);
    }
    return edge ? edge.target : null;
  }

  protected resolveText(template: string): string {
    return resolveVariables(template, this.ctx.variables, this.ctx.context);
  }

  protected ok(
    outputs: ExecutionResult['outputs'],
    nextNodeId: string | null,
    extra?: Partial<ExecutionResult>,
  ): ExecutionResult {
    return { nextNodeId, outputs, ...extra };
  }

  protected validationOk(): ValidationResult {
    return { valid: true, errors: [] };
  }

  protected validationFail(errors: string[]): ValidationResult {
    return { valid: false, errors };
  }
}
