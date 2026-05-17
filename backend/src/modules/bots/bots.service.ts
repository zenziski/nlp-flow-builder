import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { randomUUID, randomBytes } from 'crypto';
import { Bot, BotDocument } from './schemas/bot.schema';
import { CreateBotDto } from './dto/create-bot.dto';
import { UpdateBotDto } from './dto/update-bot.dto';
import {
  ConversationSession,
  ConversationSessionDocument,
} from '../runtime/schemas/conversation-session.schema';

@Injectable()
export class BotsService {
  constructor(
    @InjectModel(Bot.name) private botModel: Model<BotDocument>,
    @InjectModel(ConversationSession.name)
    private sessionModel: Model<ConversationSessionDocument>,
  ) {}

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
    return this.ensureCredentials(bot);
  }

  async create(dto: CreateBotDto, userId: string) {
    return this.botModel.create({
      ...dto,
      language: dto.language ?? 'pt',
      createdBy: new Types.ObjectId(userId),
      clientId: randomUUID(),
      clientSecret: randomBytes(32).toString('hex'),
    });
  }

  async regenerateSecret(id: string, userId: string) {
    const bot = await this.findOne(id, userId);
    bot.clientSecret = randomBytes(32).toString('hex');
    return bot.save();
  }

  /** Ensure a bot has credentials — lazy-generates for bots created before this feature. */
  async ensureCredentials(bot: BotDocument): Promise<BotDocument> {
    if (!bot.clientId || !bot.clientSecret) {
      bot.clientId = bot.clientId ?? randomUUID();
      bot.clientSecret = bot.clientSecret ?? randomBytes(32).toString('hex');
      await bot.save();
    }
    return bot;
  }

  async findByClientCredentials(clientId: string, clientSecret: string): Promise<BotDocument> {
    const bot = await this.botModel.findOne({ clientId }).exec();
    if (!bot || bot.clientSecret !== clientSecret) {
      throw new UnauthorizedException('Invalid client credentials');
    }
    return bot;
  }

  async setMainFlow(id: string, flowId: string | null, userId: string) {
    const bot = await this.findOne(id, userId);
    bot.mainFlowId = flowId ? new Types.ObjectId(flowId) : undefined;
    return bot.save();
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

  async getUsageOverview(userId: string) {
    const userOid = new Types.ObjectId(userId);
    const bots = await this.botModel.find({ createdBy: userOid }).exec();
    if (bots.length === 0) {
      return { totalSessions: 0, totalMessages: 0, uniqueUsers: 0, chart: [], bots: [] };
    }
    const botIds = bots.map((b) => b._id as Types.ObjectId);
    const now = new Date();
    const monthStart = (offset: number) =>
      new Date(now.getFullYear(), now.getMonth() - offset, 1);

    const [totals, monthly, uniqueUsers, perBot] = await Promise.all([
      this.sessionModel.aggregate([
        { $match: { botId: { $in: botIds }, isSimulator: false } },
        { $group: { _id: null, totalSessions: { $sum: 1 }, totalMessages: { $sum: { $size: '$history' } } } },
      ]),
      this.sessionModel.aggregate([
        { $match: { botId: { $in: botIds }, isSimulator: false, createdAt: { $gte: monthStart(5) } } },
        { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, sessions: { $sum: 1 }, messages: { $sum: { $size: '$history' } } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      this.sessionModel.distinct('userId', {
        botId: { $in: botIds },
        isSimulator: false,
        userId: { $not: /^anon_/ },
      }),
      this.sessionModel.aggregate([
        { $match: { botId: { $in: botIds }, isSimulator: false } },
        { $group: { _id: '$botId', sessions: { $sum: 1 }, messages: { $sum: { $size: '$history' } } } },
      ]),
    ]);

    const chart = Array.from({ length: 6 }, (_, i) => {
      const d = monthStart(5 - i);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const found = monthly.find((m: any) => m._id.year === year && m._id.month === month);
      return {
        label: d.toLocaleString('en', { month: 'short', year: '2-digit' }),
        sessions: found?.sessions ?? 0,
        messages: found?.messages ?? 0,
      };
    });

    const botsBreakdown = bots.map((bot) => {
      const stats = perBot.find(
        (p: any) => p._id.toString() === (bot._id as Types.ObjectId).toString(),
      );
      return {
        _id: (bot._id as Types.ObjectId).toString(),
        name: bot.name,
        sessions: stats?.sessions ?? 0,
        messages: stats?.messages ?? 0,
      };
    });

    return {
      totalSessions: totals[0]?.totalSessions ?? 0,
      totalMessages: totals[0]?.totalMessages ?? 0,
      uniqueUsers: uniqueUsers.length,
      chart,
      bots: botsBreakdown,
    };
  }

  async getUsage(botId: string, userId: string) {
    await this.findOne(botId, userId); // ownership check

    const botOid = new Types.ObjectId(botId);
    const now = new Date();

    // last 6 full calendar months + current partial month = 7 buckets
    const monthStart = (offset: number) => {
      const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      return d;
    };

    const [totals, monthly, uniqueUsers] = await Promise.all([
      // overall totals (exclude simulator)
      this.sessionModel.aggregate([
        { $match: { botId: botOid, isSimulator: false } },
        {
          $group: {
            _id: null,
            totalSessions: { $sum: 1 },
            totalMessages: { $sum: { $size: '$history' } },
          },
        },
      ]),

      // sessions per month for the last 6 months
      this.sessionModel.aggregate([
        {
          $match: {
            botId: botOid,
            isSimulator: false,
            createdAt: { $gte: monthStart(5) },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            sessions: { $sum: 1 },
            messages: { $sum: { $size: '$history' } },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),

      // unique non-anon users
      this.sessionModel.distinct('userId', {
        botId: botOid,
        isSimulator: false,
        userId: { $not: /^anon_/ },
      }),
    ]);

    // build a full 6-month chart (fill missing months with 0)
    const chart = Array.from({ length: 6 }, (_, i) => {
      const d = monthStart(5 - i);
      const year = d.getFullYear();
      const month = d.getMonth() + 1; // mongo $month is 1-based
      const found = monthly.find(
        (m: any) => m._id.year === year && m._id.month === month,
      );
      return {
        label: d.toLocaleString('en', { month: 'short', year: '2-digit' }),
        sessions: found?.sessions ?? 0,
        messages: found?.messages ?? 0,
      };
    });

    return {
      totalSessions: totals[0]?.totalSessions ?? 0,
      totalMessages: totals[0]?.totalMessages ?? 0,
      uniqueUsers: uniqueUsers.length,
      chart,
    };
  }
}
