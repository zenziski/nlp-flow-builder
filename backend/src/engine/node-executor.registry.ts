import { Injectable } from '@nestjs/common';
import { NodeType } from './engine.types';
import { BaseNodeExecutor } from './base-node.executor';

@Injectable()
export class NodeExecutorRegistry {
  private registry = new Map<NodeType, new (...args: any[]) => BaseNodeExecutor>();

  register(type: NodeType, executor: new (...args: any[]) => BaseNodeExecutor): void {
    this.registry.set(type, executor);
  }

  get(type: NodeType): (new (...args: any[]) => BaseNodeExecutor) | undefined {
    return this.registry.get(type);
  }

  has(type: NodeType): boolean {
    return this.registry.has(type);
  }
}
