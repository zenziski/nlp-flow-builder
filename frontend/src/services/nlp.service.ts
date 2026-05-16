import api from './api.client';
import type { Intent, Entity } from '../types/nlp.types';

export const nlpService = {
  async getIntents(botId: string): Promise<Intent[]> {
    const res = await api.get('/nlp/intents', { params: { botId } });
    return res.data.data;
  },
  async createIntent(dto: Omit<Intent, '_id'>) {
    const res = await api.post('/nlp/intents', dto);
    return res.data.data;
  },
  async updateIntent(id: string, dto: Partial<Intent>) {
    const res = await api.patch(`/nlp/intents/${id}`, dto);
    return res.data.data;
  },
  async deleteIntent(id: string) {
    const res = await api.delete(`/nlp/intents/${id}`);
    return res.data.data;
  },
  async getEntities(botId: string): Promise<Entity[]> {
    const res = await api.get('/nlp/entities', { params: { botId } });
    return res.data.data;
  },
  async createEntity(dto: Omit<Entity, '_id'>) {
    const res = await api.post('/nlp/entities', dto);
    return res.data.data;
  },
  async updateEntity(id: string, dto: Partial<Entity>) {
    const res = await api.patch(`/nlp/entities/${id}`, dto);
    return res.data.data;
  },
  async deleteEntity(id: string) {
    const res = await api.delete(`/nlp/entities/${id}`);
    return res.data.data;
  },
  async train(botId: string) {
    const res = await api.post(`/nlp/train/${botId}`);
    return res.data.data;
  },
  async process(botId: string, text: string, language?: string) {
    const res = await api.post(`/nlp/process/${botId}`, { text, language });
    return res.data.data;
  },
};
