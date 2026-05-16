import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Variable, VariableDocument } from './schemas/variable.schema';

@Injectable()
export class VariablesService {
  constructor(
    @InjectModel(Variable.name) private variableModel: Model<VariableDocument>,
  ) {}

  findAll(botId: string) {
    return this.variableModel.find({ botId: new Types.ObjectId(botId) }).exec();
  }

  async create(botId: string, dto: { key: string; defaultValue?: unknown; description?: string; scope?: string }) {
    return this.variableModel.create({ ...dto, botId: new Types.ObjectId(botId) });
  }

  async update(id: string, dto: Partial<{ key: string; defaultValue: unknown; description: string; scope: string }>) {
    const variable = await this.variableModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!variable) throw new NotFoundException('Variable not found');
    return variable;
  }

  async remove(id: string) {
    const variable = await this.variableModel.findByIdAndDelete(id).exec();
    if (!variable) throw new NotFoundException('Variable not found');
    return { deleted: true };
  }
}
