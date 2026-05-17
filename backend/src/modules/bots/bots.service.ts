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
import { Flow, FlowDocument } from '../flows/schemas/flow.schema';

@Injectable()
export class BotsService {
  constructor(
    @InjectModel(Bot.name) private botModel: Model<BotDocument>,
    @InjectModel(ConversationSession.name)
    private sessionModel: Model<ConversationSessionDocument>,
    @InjectModel(Flow.name) private flowModel: Model<FlowDocument>,
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

  async getDetailedUsage(botId: string, userId: string) {
    await this.findOne(botId, userId); // ownership check

    const botOid = new Types.ObjectId(botId);
    const now = new Date();
    const monthStart = (offset: number) =>
      new Date(now.getFullYear(), now.getMonth() - offset, 1);

    const [
      statusBreakdown,
      avgMessagesAgg,
      hourlyAgg,
      dowAgg,
      durationAgg,
      uniqueUsersAll,
      returningUsersAgg,
      intentAgg,
      monthly,
      recentSessions,
    ] = await Promise.all([
      // Session status breakdown
      this.sessionModel.aggregate([
        { $match: { botId: botOid, isSimulator: false } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // Avg / min / max messages per session
      this.sessionModel.aggregate([
        { $match: { botId: botOid, isSimulator: false } },
        {
          $group: {
            _id: null,
            avgMessages: { $avg: { $size: '$history' } },
            maxMessages: { $max: { $size: '$history' } },
            totalMessages: { $sum: { $size: '$history' } },
            totalSessions: { $sum: 1 },
          },
        },
      ]),

      // Hourly distribution (0–23) of session creation
      this.sessionModel.aggregate([
        { $match: { botId: botOid, isSimulator: false } },
        { $group: { _id: { $hour: '$createdAt' }, count: { $sum: 1 } } },
        { $sort: { '_id': 1 } },
      ]),

      // Day-of-week distribution (1=Sun…7=Sat)
      this.sessionModel.aggregate([
        { $match: { botId: botOid, isSimulator: false } },
        { $group: { _id: { $dayOfWeek: '$createdAt' }, count: { $sum: 1 } } },
        { $sort: { '_id': 1 } },
      ]),

      // Avg session duration (lastActivityAt - createdAt) in seconds
      this.sessionModel.aggregate([
        {
          $match: {
            botId: botOid,
            isSimulator: false,
            status: { $in: ['completed', 'expired'] },
          },
        },
        {
          $group: {
            _id: null,
            avgDurationSec: {
              $avg: {
                $divide: [
                  { $subtract: ['$lastActivityAt', '$createdAt'] },
                  1000,
                ],
              },
            },
          },
        },
      ]),

      // All unique non-anon users
      this.sessionModel.distinct('userId', {
        botId: botOid,
        isSimulator: false,
        userId: { $not: /^anon_/ },
      }),

      // Returning users: users who have > 1 session
      this.sessionModel.aggregate([
        { $match: { botId: botOid, isSimulator: false, userId: { $not: /^anon_/ } } },
        { $group: { _id: '$userId', sessionCount: { $sum: 1 } } },
        { $match: { sessionCount: { $gt: 1 } } },
        { $count: 'returning' },
      ]),

      // Top triggered intents (from triggeredIntents array)
      this.sessionModel.aggregate([
        { $match: { botId: botOid, isSimulator: false } },
        { $unwind: '$triggeredIntents' },
        {
          $group: {
            _id: '$triggeredIntents.intent',
            count: { $sum: 1 },
            avgScore: { $avg: '$triggeredIntents.score' },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 15 },
      ]),

      // Monthly sessions + messages (last 6 months)
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

      // Recent 5 sessions for activity feed
      this.sessionModel
        .find({ botId: botOid, isSimulator: false })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('userId status history createdAt lastActivityAt')
        .lean()
        .exec(),
    ]);

    // Build status map
    const statusMap: Record<string, number> = {};
    for (const s of statusBreakdown) statusMap[s._id] = s.count;

    // Build full 24-hour array
    const hourly = Array.from({ length: 24 }, (_, h) => {
      const found = hourlyAgg.find((x: any) => x._id === h);
      return { hour: h, count: found?.count ?? 0 };
    });

    // Build full 7-day array (1=Sun … 7=Sat)
    const dowLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dow = Array.from({ length: 7 }, (_, i) => {
      const found = dowAgg.find((x: any) => x._id === i + 1);
      return { day: dowLabels[i], count: found?.count ?? 0 };
    });

    // Monthly chart
    const chart = Array.from({ length: 6 }, (_, i) => {
      const d = monthStart(5 - i);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const found = monthly.find(
        (m: any) => m._id.year === year && m._id.month === month,
      );
      return {
        label: d.toLocaleString('en', { month: 'short', year: '2-digit' }),
        sessions: found?.sessions ?? 0,
        messages: found?.messages ?? 0,
      };
    });

    // Top intents
    const topIntents = intentAgg.map((i: any) => ({
      intent: i._id as string,
      count: i.count as number,
      avgScore: Math.round((i.avgScore ?? 0) * 100) / 100,
    }));

    const totalSessions = avgMessagesAgg[0]?.totalSessions ?? 0;
    const totalMessages = avgMessagesAgg[0]?.totalMessages ?? 0;
    const completedSessions = statusMap['completed'] ?? 0;
    const uniqueUsers = uniqueUsersAll.length;
    const returningUsers = returningUsersAgg[0]?.returning ?? 0;

    // Recent sessions summary
    const recentActivity = (recentSessions as any[]).map((s) => ({
      sessionId: s._id.toString(),
      userId: s.userId as string,
      status: s.status as string,
      messageCount: Array.isArray(s.history) ? (s.history as unknown[]).length : 0,
      createdAt: s.createdAt as Date,
      lastActivityAt: s.lastActivityAt as Date,
    }));

    return {
      totalSessions,
      totalMessages,
      uniqueUsers,
      returningUsers,
      completionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
      avgMessagesPerSession: Math.round((avgMessagesAgg[0]?.avgMessages ?? 0) * 10) / 10,
      maxMessagesInSession: avgMessagesAgg[0]?.maxMessages ?? 0,
      avgSessionDurationSec: Math.round(durationAgg[0]?.avgDurationSec ?? 0),
      statusBreakdown: {
        active: statusMap['active'] ?? 0,
        completed: statusMap['completed'] ?? 0,
        expired: statusMap['expired'] ?? 0,
        error: statusMap['error'] ?? 0,
      },
      hourly,
      dow,
      chart,
      topIntents,
      recentActivity,
    };
  }

  async getPathAnalysis(botId: string, userId: string) {
    await this.findOne(botId, userId); // ownership check
    const botOid = new Types.ObjectId(botId);

    const sessions = await this.sessionModel
      .find({ botId: botOid, isSimulator: false })
      .select('history flowId')
      .lean()
      .exec();

    if (sessions.length === 0) {
      return { nodes: [], edges: [], totalSessions: 0 };
    }

    // Gather node metadata from all flows referenced by sessions
    const flowIdStrings = [...new Set(sessions.map((s: any) => s.flowId?.toString()).filter(Boolean))];
    const flows = await this.flowModel
      .find({ _id: { $in: flowIdStrings.map((id) => new Types.ObjectId(id)) } })
      .select('nodes')
      .lean()
      .exec();

    const nodeTypeLabels: Record<string, string> = {
      startNode: 'Start', endNode: 'End', messageNode: 'Message',
      inputNode: 'Input', intentNode: 'Intent', conditionNode: 'Condition',
      switchNode: 'Switch', apiNode: 'API Call', variableNode: 'Variable',
      delayNode: 'Delay', redirectNode: 'Redirect', randomNode: 'Random',
      subflowNode: 'Subflow',
    };

    const nodeInfoMap = new Map<string, { type: string; label: string }>();
    for (const flow of flows) {
      for (const node of (flow.nodes as any[]) ?? []) {
        if (!nodeInfoMap.has(node.id)) {
          const rawLabel =
            (node.data?.label as string) ||
            (node.data?.name as string) ||
            (node.data?.message as string)?.slice(0, 30) ||
            (node.data?.prompt as string)?.slice(0, 30) ||
            nodeTypeLabels[node.type] ||
            node.type;
          nodeInfoMap.set(node.id, { type: node.type ?? 'unknown', label: rawLabel });
        }
      }
    }

    // Build transition and visit counts from session history
    const visitCounts = new Map<string, number>();
    const transitionCounts = new Map<string, number>();

    for (const session of sessions) {
      const history = (session as any).history as Array<{ role: string; nodeId?: string }> ?? [];
      const nodeSeq: string[] = [];

      for (const turn of history) {
        if (turn.role === 'bot' && turn.nodeId) {
          const last = nodeSeq[nodeSeq.length - 1];
          if (turn.nodeId !== last) nodeSeq.push(turn.nodeId);
        }
      }

      for (const id of nodeSeq) {
        visitCounts.set(id, (visitCounts.get(id) ?? 0) + 1);
      }
      for (let i = 0; i < nodeSeq.length - 1; i++) {
        const key = `${nodeSeq[i]}::${nodeSeq[i + 1]}`;
        transitionCounts.set(key, (transitionCounts.get(key) ?? 0) + 1);
      }
    }

    // Cap to top 30 nodes by visit count for readability
    const topNodes = Array.from(visitCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([id, visitCount]) => {
        const info = nodeInfoMap.get(id) ?? { type: 'unknown', label: id.slice(0, 8) };
        return { id, type: info.type, label: info.label, visitCount };
      });

    const topNodeIds = new Set(topNodes.map((n) => n.id));

    const edges = Array.from(transitionCounts.entries())
      .filter(([key]) => {
        const [from, to] = key.split('::');
        return topNodeIds.has(from) && topNodeIds.has(to) && from !== to;
      })
      .map(([key, count]) => {
        const [from, to] = key.split('::');
        return { from, to, count };
      })
      .sort((a, b) => b.count - a.count);

    return { nodes: topNodes, edges, totalSessions: sessions.length };
  }

  async getSessions(botId: string, userId: string) {
    await this.findOne(botId, userId); // ownership check
    return this.sessionModel
      .find({ botId: new Types.ObjectId(botId), isSimulator: false })
      .select('_id userId status createdAt lastActivityAt history triggeredIntents')
      .sort({ createdAt: -1 })
      .limit(200)
      .lean()
      .exec();
  }

  async getSession(botId: string, sessionId: string, userId: string) {
    await this.findOne(botId, userId); // ownership check
    const session = await this.sessionModel
      .findOne({
        _id: new Types.ObjectId(sessionId),
        botId: new Types.ObjectId(botId),
      })
      .lean()
      .exec();
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }
}
