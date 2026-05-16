import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Bot, BotDocument } from './schemas/bot.schema';
import { CreateBotDto } from './dto/create-bot.dto';
import { UpdateBotDto } from './dto/update-bot.dto';

@Injectable()
export class BotsService {
  constructor(@InjectModel(Bot.name) private botModel: Model<BotDocument>) {}

  findAll(userId: string) {
    return this.botModel
      .find({ createdBy: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string, userId: string) {
    const bot = await this.botModel.findById(id).exec();
    if (!bot) throw new NotFoundException('Bot not found');
    this.assertOwnership(bot, userId);
    return bot;
  }

  async create(dto: CreateBotDto, userId: string) {
    return this.botModel.create({
      ...dto,
      language: dto.language ?? 'pt',
      createdBy: new Types.ObjectId(userId),
    });
  }

  async update(id: string, dto: UpdateBotDto, userId: string) {
    const bot = await this.findOne(id, userId);
    Object.assign(bot, dto);
    return bot.save();
  }

  async remove(id: string, userId: string) {
    const bot = await this.findOne(id, userId);
    await bot.deleteOne();
    return { deleted: true };
  }

  private assertOwnership(bot: BotDocument, userId: string) {
    if (bot.createdBy.toString() !== userId) {
      throw new ForbiddenException('Access denied');
    }
  }
}
