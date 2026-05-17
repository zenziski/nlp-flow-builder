import api from './api.client';
import type { CreateBotDto, UpdateBotDto } from '../types/bot.types';

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
};
