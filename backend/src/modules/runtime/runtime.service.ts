import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Flow, FlowDocument, NodeSubdoc, EdgeSubdoc } from '../flows/schemas/flow.schema';
import { Bot, BotDocument } from '../bots/schemas/bot.schema';
import { SessionService } from './session.service';
import { NodeExecutorFactory } from '../../engine/node-executor.factory';
import { ExecutionContext, BotOutput, ExecutionLog } from '../../engine/engine.types';
import { VaultService } from '../vault/vault.service';

const MAX_ITERATIONS = 50;

export interface RuntimeResponse {
  sessionId?: string;
  outputs: BotOutput[];
  currentNodeId?: string;
  variables: Record<string, unknown>;
  context: Record<string, unknown>;
  logs: ExecutionLog[];
  waitForInput: boolean;
  sessionEnded: boolean;
}

@Injectable()
export class RuntimeService {
  constructor(
    @InjectModel(Flow.name) private flowModel: Model<FlowDocument>,
    @InjectModel(Bot.name) private botModel: Model<BotDocument>,
    private sessionService: SessionService,
    private executorFactory: NodeExecutorFactory,
    private vaultService: VaultService,
  ) {}

  async startSession(
    botId: string,
    flowId: string,
    userId: string,
    isSimulator = false,
    onOutput?: (output: BotOutput) => void,
  ): Promise<RuntimeResponse> {
    const session = await this.sessionService.getOrCreate(botId, flowId, userId, isSimulator);
    const flow = await this.loadFlow(flowId);
    const startNode = (flow.nodes as NodeSubdoc[]).find((n) => n.type === 'startNode');
    if (!startNode) throw new BadRequestException('Flow has no Start node');

    await this.sessionService.updateState(session._id.toString(), {
      currentNodeId: startNode.id,
    });

    const response = await this.processFromNode(session._id.toString(), flow, startNode, undefined, onOutput);
    return { ...response, sessionId: session._id.toString() };
  }

  async processMessage(
    sessionId: string,
    input: string,
    onOutput?: (output: BotOutput) => void,
  ): Promise<RuntimeResponse> {
    const session = await this.sessionService.findById(sessionId);
    await this.sessionService.checkNotExpired(session);
    const flow = await this.loadFlow(session.flowId.toString());

    const currentNode = (flow.nodes as NodeSubdoc[]).find(
      (n) => n.id === session.currentNodeId,
    );
    if (!currentNode) throw new BadRequestException('Current node not found in flow');

    await this.sessionService.updateState(sessionId, {
      turn: { role: 'user', content: input, timestamp: new Date() },
    });

    return this.processFromNode(sessionId, flow, currentNode, input, onOutput);
  }

  private async processFromNode(
    sessionId: string,
    flow: FlowDocument,
    startNode: NodeSubdoc,
    input: string | undefined,
    onOutput?: (output: BotOutput) => void,
  ): Promise<RuntimeResponse> {
    const session = await this.sessionService.findById(sessionId);

    let currentNode = startNode;
    let variables = { ...(session.variables ?? {}) };
    let context = { ...(session.context ?? {}) };

    // Inject vault variables as a read-only namespace accessible via {{vault.KEY}}
    const bot = await this.botModel.findById(session.botId).exec();
    if (bot) {
      const vaultMap = await this.vaultService.getDecryptedMapForUser(bot.createdBy.toString());
      variables = { ...variables, vault: vaultMap };
    }

    let currentInput: string | undefined = input;
    const outputs: BotOutput[] = [];
    const logs: ExecutionLog[] = [];
    let iterations = 0;
    let waitForInput = false;
    let sessionEnded = false;

    while (iterations < MAX_ITERATIONS) {
      iterations++;
      const start = Date.now();

      const ctx: ExecutionContext = {
        sessionId,
        botId: session.botId.toString(),
        flowId: session.flowId.toString(),
        userId: session.userId,
        currentNode,
        nodes: flow.nodes as NodeSubdoc[],
        edges: flow.edges as EdgeSubdoc[],
        input: currentInput,
        variables,
        context,
        history: session.history ?? [],
        logs,
      };

      const executor = this.executorFactory.create(currentNode.type as any, ctx);
      const result = await executor.execute();

      const log: ExecutionLog = {
        nodeId: currentNode.id,
        nodeType: currentNode.type as any,
        input: currentInput,
        output: result.outputs.map((o) => o.content).filter(Boolean).join(' | '),
        timestamp: new Date(),
        durationMs: Date.now() - start,
      };
      logs.push(log);

      for (const out of result.outputs) {
        // Never forward the internal subflow signal to the client
        if (out.type !== 'subflow') {
          outputs.push(out);
          onOutput?.(out);
        }
      }

      if (result.variableUpdates) {
        Object.assign(variables, result.variableUpdates);
      }
      if (result.contextUpdates) {
        Object.assign(context, result.contextUpdates);
      }

      // ── Subflow inline expansion ──────────────────────────────────────
      const subflowOut = result.outputs.find((o) => o.type === 'subflow');
      if (subflowOut?.subflowId) {
        const sub = await this.executeSubflowInline(
          subflowOut.subflowId,
          session.botId.toString(),
          session.userId,
          sessionId,
          variables,
          context,
          session.history ?? [],
          logs,
          0,
          onOutput,
        );
        variables = sub.variables;
        context = sub.context;
        for (const o of sub.outputs) { outputs.push(o); }
        if (sub.waitForInput) { waitForInput = true; break; }
        // Advance to the node connected after this subflowNode in the parent flow
        const nextId = this.resolveNextNode(flow.edges as EdgeSubdoc[], currentNode.id);
        if (!nextId) break;
        const nextNode = (flow.nodes as NodeSubdoc[]).find((n) => n.id === nextId);
        if (!nextNode) break;
        currentNode = nextNode;
        currentInput = undefined;
        continue;
      }
      // ─────────────────────────────────────────────────────────────────

      currentInput = undefined;

      const ended = result.outputs.some((o) => o.type === 'end');
      if (ended) { sessionEnded = true; break; }

      if (result.waitForInput) { waitForInput = true; break; }

      const delayOutput = result.outputs.find((o) => o.type === 'delay');
      if (delayOutput?.delay) {
        await new Promise((resolve) => setTimeout(resolve, delayOutput.delay));
      }

      if (result.nextNodeId === null) break;

      const nextNode = (flow.nodes as NodeSubdoc[]).find((n) => n.id === result.nextNodeId);
      if (!nextNode) break;

      currentNode = nextNode;
    }

    // Strip vault namespace before persisting — vault values are loaded fresh each execution
    const { vault: _vault, ...variablesToSave } = variables as any;
    await this.sessionService.updateState(sessionId, {
      currentNodeId: currentNode.id,
      variables: variablesToSave,
      context,
    });

    for (const output of outputs) {
      if (output.type === 'text' && output.content) {
        await this.sessionService.updateState(sessionId, {
          turn: { role: 'bot', content: output.content, timestamp: new Date(), nodeId: currentNode.id },
        });
      }
    }

    if (sessionEnded) {
      await this.sessionService.complete(sessionId);
    }

    return {
      outputs,
      currentNodeId: currentNode.id,
      variables,
      context,
      logs,
      waitForInput,
      sessionEnded,
    };
  }

  private async loadFlow(flowId: string): Promise<FlowDocument> {
    const flow = await this.flowModel.findById(flowId).exec();
    if (!flow) throw new NotFoundException('Flow not found');
    return flow;
  }

  /** Resolve the first edge leaving a node (mirrors BaseNodeExecutor.resolveEdge). */
  private resolveNextNode(edges: EdgeSubdoc[], sourceId: string, handle?: string): string | null {
    let edge = edges.find((e) => e.source === sourceId && (handle ? e.sourceHandle === handle : !e.sourceHandle));
    if (!edge) edge = edges.find((e) => e.source === sourceId);
    return edge ? edge.target : null;
  }

  /**
   * Run a sub-flow inline within the current session context.
   * Variables and context are shared; session currentNodeId is NOT updated
   * for individual sub-flow nodes (only the parent flow updates it).
   * Supports up to 5 levels of nesting; waitForInput inside a sub-flow
   * bubbles up to the parent, pausing the whole session.
   */
  private async executeSubflowInline(
    subflowId: string,
    botId: string,
    userId: string,
    sessionId: string,
    variables: Record<string, unknown>,
    context: Record<string, unknown>,
    history: any[],
    logs: ExecutionLog[],
    depth: number,
    onOutput?: (output: BotOutput) => void,
  ): Promise<{ variables: Record<string, unknown>; context: Record<string, unknown>; outputs: BotOutput[]; waitForInput: boolean }> {
    if (depth > 5) {
      throw new BadRequestException('Subflow recursion limit exceeded (max depth: 5)');
    }

    const subflow = await this.loadFlow(subflowId);
    const startNode = (subflow.nodes as NodeSubdoc[]).find((n) => n.type === 'startNode');
    if (!startNode) {
      return { variables, context, outputs: [], waitForInput: false };
    }

    let currentNode = startNode;
    let currentVariables = { ...variables };
    let currentContext = { ...context };
    const outputs: BotOutput[] = [];
    let iterations = 0;
    let waitForInput = false;

    while (iterations < MAX_ITERATIONS) {
      iterations++;
      const start = Date.now();

      const ctx: ExecutionContext = {
        sessionId,
        botId,
        flowId: subflowId,
        userId,
        currentNode,
        nodes: subflow.nodes as NodeSubdoc[],
        edges: subflow.edges as EdgeSubdoc[],
        input: undefined,
        variables: currentVariables,
        context: currentContext,
        history,
        logs,
      };

      const executor = this.executorFactory.create(currentNode.type as any, ctx);
      const result = await executor.execute();

      logs.push({
        nodeId: currentNode.id,
        nodeType: currentNode.type as any,
        output: result.outputs.map((o) => o.content).filter(Boolean).join(' | '),
        timestamp: new Date(),
        durationMs: Date.now() - start,
      });

      // Handle nested sub-flows recursively; never forward 'subflow' or 'end' signals
      for (const out of result.outputs) {
        if (out.type === 'subflow' && out.subflowId) {
          const nested = await this.executeSubflowInline(
            out.subflowId,
            botId,
            userId,
            sessionId,
            currentVariables,
            currentContext,
            history,
            logs,
            depth + 1,
            onOutput,
          );
          currentVariables = nested.variables;
          currentContext = nested.context;
          for (const o of nested.outputs) { outputs.push(o); onOutput?.(o); }
          if (nested.waitForInput) { waitForInput = true; break; }
        } else if (out.type !== 'end') {
          // 'end' is internal to this subflow — do not propagate to the parent
          outputs.push(out);
          onOutput?.(out);
        }
      }

      if (result.variableUpdates) Object.assign(currentVariables, result.variableUpdates);
      if (result.contextUpdates) Object.assign(currentContext, result.contextUpdates);

      if (result.outputs.some((o) => o.type === 'end')) break;
      if (result.waitForInput) { waitForInput = true; break; }
      if (waitForInput) break;

      const delayOut = result.outputs.find((o) => o.type === 'delay');
      if (delayOut?.delay) {
        await new Promise((resolve) => setTimeout(resolve, delayOut.delay));
      }

      if (result.nextNodeId === null) break;
      const nextNode = (subflow.nodes as NodeSubdoc[]).find((n) => n.id === result.nextNodeId);
      if (!nextNode) break;
      currentNode = nextNode;
    }

    return { variables: currentVariables, context: currentContext, outputs, waitForInput };
  }
}
