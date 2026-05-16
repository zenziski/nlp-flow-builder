import { Injectable, NotFoundException, GoneException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ConversationSession,
  ConversationSessionDocument,
  ConversationTurn,
} from './schemas/conversation-session.schema';
import { Bot, BotDocument } from '../bots/schemas/bot.schema';

@Injectable()
export class SessionService {
  constructor(
    @InjectModel(ConversationSession.name)
    private sessionModel: Model<ConversationSessionDocument>,
    @InjectModel(Bot.name)
    private botModel: Model<BotDocument>,
  ) {}

  private async getTimeoutMinutes(botId: string): Promise<number> {
    const bot = await this.botModel.findById(botId).select('settings').lean().exec();
    return (bot?.settings as any)?.sessionTimeoutMinutes ?? 0;
  }

  private isExpired(session: ConversationSessionDocument, timeoutMinutes: number): boolean {
    if (!timeoutMinutes) return false;
    const cutoff = new Date(Date.now() - timeoutMinutes * 60 * 1000);
    return session.lastActivityAt < cutoff;
  }

  async getOrCreate(
    botId: string,
    flowId: string,
    userId: string,
    isSimulator = false,
  ): Promise<ConversationSessionDocument> {
    const existing = await this.sessionModel
      .findOne({ botId: new Types.ObjectId(botId), userId, status: 'active', isSimulator })
      .exec();

    if (existing) {
      const timeoutMinutes = await this.getTimeoutMinutes(botId);
      if (this.isExpired(existing, timeoutMinutes)) {
        await this.sessionModel
          .findByIdAndUpdate(existing._id, { $set: { status: 'expired' } })
          .exec();
      } else {
        return existing;
      }
    }

    return this.sessionModel.create({
      botId: new Types.ObjectId(botId),
      flowId: new Types.ObjectId(flowId),
      userId,
      isSimulator,
      status: 'active',
      lastActivityAt: new Date(),
    });
  }

  async findById(id: string): Promise<ConversationSessionDocument> {
    const session = await this.sessionModel.findById(id).exec();
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async checkNotExpired(session: ConversationSessionDocument): Promise<void> {
    const timeoutMinutes = await this.getTimeoutMinutes(session.botId.toString());
    if (this.isExpired(session, timeoutMinutes)) {
      await this.sessionModel
        .findByIdAndUpdate(session._id, { $set: { status: 'expired' } })
        .exec();
      throw new GoneException('Session has expired. Please start a new conversation.');
    }
  }

  async updateState(
    sessionId: string,
    patch: {
      currentNodeId?: string;
      variables?: Record<string, unknown>;
      context?: Record<string, unknown>;
      turn?: ConversationTurn;
    },
  ) {
    const update: Record<string, unknown> = { lastActivityAt: new Date() };
    if (patch.currentNodeId !== undefined)
      update['currentNodeId'] = patch.currentNodeId;
    if (patch.variables) update['variables'] = patch.variables;
    if (patch.context) update['context'] = patch.context;

    const push: Record<string, unknown> = {};
    if (patch.turn) push['history'] = patch.turn;

    const ops: Record<string, unknown> = { $set: update };
    if (Object.keys(push).length) ops['$push'] = push;

    return this.sessionModel.findByIdAndUpdate(sessionId, ops, { new: true }).exec();
  }

  async complete(sessionId: string) {
    return this.sessionModel
      .findByIdAndUpdate(sessionId, { $set: { status: 'completed' } }, { new: true })
      .exec();
  }

  async reset(sessionId: string) {
    return this.sessionModel
      .findByIdAndUpdate(
        sessionId,
        {
          $set: {
            currentNodeId: undefined,
            context: {},
            variables: {},
            history: [],
            status: 'active',
            lastActivityAt: new Date(),
          },
        },
        { new: true },
      )
      .exec();
  }

  async deleteSession(sessionId: string) {
    return this.sessionModel.findByIdAndDelete(sessionId).exec();
  }
}
