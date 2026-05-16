import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Flow, FlowDocument, NodeSubdoc, EdgeSubdoc } from './schemas/flow.schema';
import { Bot, BotDocument } from '../bots/schemas/bot.schema';
import { CreateFlowDto } from './dto/create-flow.dto';
import { UpdateFlowDto, SaveCanvasDto, ImportFlowDto } from './dto/update-flow.dto';

export interface ValidationError {
  nodeId?: string;
  type: 'error' | 'warning';
  message: string;
}

@Injectable()
export class FlowsService {
  constructor(
    @InjectModel(Flow.name) private flowModel: Model<FlowDocument>,
    @InjectModel(Bot.name) private botModel: Model<BotDocument>,
  ) {}

  async findAll(botId: string, userId: string) {
    await this.assertBotAccess(botId, userId);
    return this.flowModel
      .find({ botId: new Types.ObjectId(botId) }, { nodes: 0, edges: 0 })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string, userId: string) {
    const flow = await this.flowModel.findById(id).exec();
    if (!flow) throw new NotFoundException('Flow not found');
    await this.assertBotAccess(flow.botId.toString(), userId);
    return flow;
  }

  async create(dto: CreateFlowDto, userId: string) {
    await this.assertBotAccess(dto.botId, userId);
    const startNodeId = `start-${Date.now()}`;
    const startNode: NodeSubdoc = {
      id: startNodeId,
      type: 'startNode',
      position: { x: 250, y: 100 },
      data: { label: 'Start' },
    };
    return this.flowModel.create({
      name: dto.name,
      botId: new Types.ObjectId(dto.botId),
      description: dto.description,
      startNodeId,
      nodes: [startNode],
      edges: [],
    });
  }

  async update(id: string, dto: UpdateFlowDto, userId: string) {
    const flow = await this.findOne(id, userId);
    Object.assign(flow, dto);
    return flow.save();
  }

  async saveCanvas(id: string, dto: SaveCanvasDto, userId: string) {
    const flow = await this.findOne(id, userId);
    flow.nodes = dto.nodes ?? [];
    flow.edges = dto.edges ?? [];
    if (dto.startNodeId !== undefined) {
      flow.startNodeId = dto.startNodeId;
    } else {
      const startNode = flow.nodes.find((n: NodeSubdoc) => n.type === 'startNode');
      if (startNode) flow.startNodeId = startNode.id;
    }
    return flow.save();
  }

  async publish(id: string, userId: string) {
    const flow = await this.findOne(id, userId);
    const errors = this.runValidation(flow.nodes as NodeSubdoc[], flow.edges as EdgeSubdoc[]);
    const hasErrors = errors.some((e) => e.type === 'error');
    if (hasErrors) {
      throw new BadRequestException({
        message: 'Flow has validation errors',
        errors,
      });
    }
    flow.version = (flow.version ?? 0) + 1;
    flow.published = true;
    return flow.save();
  }

  async duplicate(id: string, userId: string) {
    const flow = await this.findOne(id, userId);
    const { _id, createdAt, updatedAt, ...rest } = (flow.toObject() as any);
    return this.flowModel.create({
      ...rest,
      name: `[Copy] ${flow.name}`,
      published: false,
      version: 1,
    });
  }

  async exportJson(id: string, userId: string) {
    const flow = await this.findOne(id, userId);
    const obj = flow.toObject() as any;
    delete obj.__v;
    return obj;
  }

  async importJson(botId: string, dto: ImportFlowDto, userId: string) {
    await this.assertBotAccess(botId, userId);
    return this.flowModel.create({
      name: dto.name ?? 'Imported Flow',
      botId: new Types.ObjectId(botId),
      description: dto.description,
      startNodeId: dto.startNodeId,
      nodes: dto.nodes ?? [],
      edges: dto.edges ?? [],
      version: 1,
      published: false,
    });
  }

  async validate(id: string, userId: string) {
    const flow = await this.findOne(id, userId);
    const errors = this.runValidation(
      flow.nodes as NodeSubdoc[],
      flow.edges as EdgeSubdoc[],
    );
    return { valid: errors.filter((e) => e.type === 'error').length === 0, errors };
  }

  async remove(id: string, userId: string) {
    const flow = await this.findOne(id, userId);
    await flow.deleteOne();
    return { deleted: true };
  }

  private runValidation(nodes: NodeSubdoc[], edges: EdgeSubdoc[]): ValidationError[] {
    const errors: ValidationError[] = [];

    const startNodes = nodes.filter((n) => n.type === 'startNode');
    if (startNodes.length === 0)
      errors.push({ type: 'error', message: 'Flow has no Start node' });
    if (startNodes.length > 1)
      errors.push({ type: 'error', message: 'Flow has multiple Start nodes' });

    const nodeIds = new Set(nodes.map((n) => n.id));

    for (const edge of edges) {
      if (!nodeIds.has(edge.source))
        errors.push({ type: 'error', message: `Edge references non-existent source node: ${edge.source}` });
      if (!nodeIds.has(edge.target))
        errors.push({ type: 'error', message: `Edge references non-existent target node: ${edge.target}` });
    }

    for (const node of nodes) {
      if (node.type === 'endNode') continue;
      const hasOutgoing = edges.some((e) => e.source === node.id);
      if (!hasOutgoing) {
        const label = (node.data?.label as string) ?? node.type;
        errors.push({
          nodeId: node.id,
          type: 'error',
          message: `Node "${label}" has no outgoing connection`,
        });
      }
    }

    for (const node of nodes) {
      if (node.type === 'startNode') continue;
      const hasIncoming = edges.some((e) => e.target === node.id);
      if (!hasIncoming) {
        const label = (node.data?.label as string) ?? node.type;
        errors.push({
          nodeId: node.id,
          type: 'warning',
          message: `Node "${label}" is unreachable (no incoming connections)`,
        });
      }
    }

    return errors;
  }

  private async assertBotAccess(botId: string, userId: string) {
    const bot = await this.botModel.findById(botId).exec();
    if (!bot) throw new NotFoundException('Bot not found');
    if (bot.createdBy.toString() !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return bot;
  }
}
