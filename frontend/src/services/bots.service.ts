import api from './api.client';
import type { CreateBotDto, UpdateBotDto } from '../types/bot.types';

export interface ConversationTurn {
  role: 'user' | 'bot';
  content: string;
  timestamp: string;
  nodeId?: string;
}

export interface ConversationSessionSummary {
  _id: string;
  userId: string;
  status: 'active' | 'completed' | 'expired' | 'error';
  createdAt: string;
  lastActivityAt: string;
  history: ConversationTurn[];
  triggeredIntents: { intent: string; score: number; timestamp: string }[];
}

export interface ConversationSession extends ConversationSessionSummary {
  botId: string;
  flowId: string;
  currentNodeId?: string;
  variables: Record<string, unknown>;
  context: Record<string, unknown>;
}

export const botsService = {
  async findAll() {
    const res = await api.get('/bots');
    return res.data.data;
  },
  async findOne(id: string) {
    const res = await api.get(`/bots/${id}`);
    return res.data.data;
  },
  async create(dto: CreateBotDto) {
    const res = await api.post('/bots', dto);
    return res.data.data;
  },
  async update(id: string, dto: UpdateBotDto) {
    const res = await api.patch(`/bots/${id}`, dto);
    return res.data.data;
  },
  async remove(id: string) {
    const res = await api.delete(`/bots/${id}`);
    return res.data.data;
  },
  async regenerateSecret(id: string) {
    const res = await api.post(`/bots/${id}/regenerate-secret`);
    return res.data.data;
  },
  async setMainFlow(id: string, flowId: string | null) {
    const res = await api.patch(`/bots/${id}/main-flow`, { flowId });
    return res.data.data;
  },
  async getUsage(id: string) {
    const res = await api.get(`/bots/${id}/usage`);
    return res.data.data as {
      totalSessions: number;
      totalMessages: number;
      uniqueUsers: number;
      chart: { label: string; sessions: number; messages: number }[];
    };
  },
  async getUsageOverview() {
    const res = await api.get('/bots/usage-overview');
    return res.data.data as {
      totalSessions: number;
      totalMessages: number;
      uniqueUsers: number;
      chart: { label: string; sessions: number; messages: number }[];
      bots: { _id: string; name: string; sessions: number; messages: number }[];
    };
  },

  async getDetailedUsage(id: string) {    const res = await api.get(`/bots/${id}/usage/detailed`);
    return res.data.data as {
      totalSessions: number;
      totalMessages: number;
      uniqueUsers: number;
      returningUsers: number;
      completionRate: number;
      avgMessagesPerSession: number;
      maxMessagesInSession: number;
      avgSessionDurationSec: number;
      statusBreakdown: { active: number; completed: number; expired: number; error: number };
      hourly: { hour: number; count: number }[];
      dow: { day: string; count: number }[];
      chart: { label: string; sessions: number; messages: number }[];
      topIntents: { intent: string; count: number; avgScore: number }[];
      recentActivity: {
        sessionId: string;
        userId: string;
        status: string;
        messageCount: number;
        createdAt: string;
        lastActivityAt: string;
      }[];
    };
  },

  async getPathAnalysis(id: string) {
    const res = await api.get(`/bots/${id}/usage/path-analysis`);
    return res.data.data as {
      nodes: { id: string; type: string; label: string; visitCount: number }[];
      edges: { from: string; to: string; count: number }[];
      totalSessions: number;
    };
  },

  async getSessions(botId: string) {
    const res = await api.get(`/bots/${botId}/sessions`);
    return res.data.data as ConversationSessionSummary[];
  },

  async getSession(botId: string, sessionId: string) {
    const res = await api.get(`/bots/${botId}/sessions/${sessionId}`);
    return res.data.data as ConversationSession;
  },
};
