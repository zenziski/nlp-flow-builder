import { Logger } from '@nestjs/common';
import { BaseNodeExecutor } from '../base-node.executor';
import { BotOutput, ExecutionResult, ValidationResult } from '../engine.types';
import { NlpService } from '../../modules/nlp/nlp.service';

export class IntentNodeExecutor extends BaseNodeExecutor {
  private readonly logger = new Logger(IntentNodeExecutor.name);

  constructor(ctx: any, private nlpService: NlpService) {
    super(ctx);
  }

  /** Strict edge lookup — only matches if the exact sourceHandle exists. No fallback. */
  private resolveIntentEdge(handle: string): string | null {
    const edge = this.ctx.edges.find(
      (e) => e.source === this.ctx.currentNode.id && e.sourceHandle === handle,
    );
    return edge ? edge.target : null;
  }

  async validate(): Promise<ValidationResult> {
    if (!this.ctx.input) {
      return this.validationFail(['IntentNode requires user input']);
    }
    return this.validationOk();
  }

  async execute(): Promise<ExecutionResult> {
    if (!this.ctx.input) {
      return this.ok([], null, { waitForInput: true });
    }

    const data = this.ctx.currentNode.data as Record<string, unknown>;
    const language = (data?.language as string) ?? 'pt';
    const confidenceThreshold = (data?.confidenceThreshold as number) ?? 0.6;

    const nlpResult = await this.nlpService.process(this.ctx.botId, {
      text: this.ctx.input,
      language,
    });

    const contextUpdates = { nlpResult };

    const meetsThreshold = nlpResult.score >= confidenceThreshold;
    this.logger.log(
      `[IntentNode] sessionId=${this.ctx.sessionId ?? 'n/a'} | input="${this.ctx.input}"` +
      ` | intent=${nlpResult.intent} | score=${nlpResult.score.toFixed(4)} | threshold=${confidenceThreshold}` +
      ` | meetsThreshold=${meetsThreshold}` +
      ` | entities=${JSON.stringify(nlpResult.entities.map(e => `${e.entity}:${e.value}`))}`,
    );

    const isNoneIntent = !nlpResult.intent || nlpResult.intent === 'None';

    let nextNodeId: string | null = null;
    if (meetsThreshold && !isNoneIntent) {
      nextNodeId = this.resolveIntentEdge(nlpResult.intent);
      this.logger.debug(`[IntentNode] Routing to intent edge "${nlpResult.intent}" → nodeId=${nextNodeId ?? 'not found'}`);
    }
    if (!nextNodeId) {
      nextNodeId = this.resolveIntentEdge('fallback');
      this.logger.debug(`[IntentNode] Routing to fallback edge → nodeId=${nextNodeId ?? 'not found'}`);
    }
    if (!nextNodeId) {
      nextNodeId = this.resolveEdge();
      this.logger.debug(`[IntentNode] Routing to default edge → nodeId=${nextNodeId ?? 'not found'}`);
    }

    const outputs: BotOutput[] = [];
    if (nlpResult.answer) {
      outputs.push({ type: 'text' as const, content: nlpResult.answer });
    }

    return this.ok(outputs, nextNodeId, { contextUpdates });
  }
}
