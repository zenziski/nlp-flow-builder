import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Flow, FlowDocument, NodeSubdoc } from '../flows/schemas/flow.schema';
import { FlowsService } from '../flows/flows.service';
import { CreateNodeDto, UpdateNodeDto } from './dto/node.dto';

@Injectable()
export class NodesService {
  constructor(
    @InjectModel(Flow.name) private flowModel: Model<FlowDocument>,
    private flowsService: FlowsService,
  ) {}

  async findAll(flowId: string, userId: string) {
    const flow = await this.flowsService.findOne(flowId, userId);
    return flow.nodes;
  }

  async findOne(flowId: string, nodeId: string, userId: string) {
    const flow = await this.flowsService.findOne(flowId, userId);
    const node = (flow.nodes as NodeSubdoc[]).find((n) => n.id === nodeId);
    if (!node) throw new NotFoundException('Node not found');
    return node;
  }

  async create(flowId: string, dto: CreateNodeDto, userId: string) {
    await this.flowsService.findOne(flowId, userId);
    const result = await this.flowModel
      .findByIdAndUpdate(
        flowId,
        { $push: { nodes: dto } },
        { new: true },
      )
      .exec();
    return result?.nodes.find((n: NodeSubdoc) => n.id === dto.id);
  }

  async update(flowId: string, nodeId: string, dto: UpdateNodeDto, userId: string) {
    await this.flowsService.findOne(flowId, userId);
    const updateFields: Record<string, unknown> = {};
    if (dto.position !== undefined) updateFields['nodes.$.position'] = dto.position;
    if (dto.data !== undefined) updateFields['nodes.$.data'] = dto.data;

    const result = await this.flowModel
      .findOneAndUpdate(
        { _id: flowId, 'nodes.id': nodeId },
        { $set: updateFields },
        { new: true },
      )
      .exec();
    if (!result) throw new NotFoundException('Node not found');
    return (result.nodes as NodeSubdoc[]).find((n) => n.id === nodeId);
  }

  async remove(flowId: string, nodeId: string, userId: string) {
    await this.flowsService.findOne(flowId, userId);
    await this.flowModel
      .findByIdAndUpdate(flowId, {
        $pull: {
          nodes: { id: nodeId },
          edges: { $or: [{ source: nodeId }, { target: nodeId }] },
        },
      })
      .exec();
    return { deleted: true };
  }
}
