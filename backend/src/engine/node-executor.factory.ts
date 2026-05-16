import { Injectable } from '@nestjs/common';
import { NodeType, ExecutionContext } from './engine.types';
import { BaseNodeExecutor } from './base-node.executor';
import { NodeExecutorRegistry } from './node-executor.registry';
import { NlpService } from '../modules/nlp/nlp.service';

@Injectable()
export class NodeExecutorFactory {
  constructor(
    private registry: NodeExecutorRegistry,
    private nlpService: NlpService,
  ) {}

  create(type: NodeType, ctx: ExecutionContext): BaseNodeExecutor {
    const ExecutorClass = this.registry.get(type);
    if (!ExecutorClass) {
      throw new Error(`No executor registered for node type: "${type}"`);
    }
    // Pass nlpService as second arg for executors that need it (IntentNode)
    return new ExecutorClass(ctx, this.nlpService);
  }
}
