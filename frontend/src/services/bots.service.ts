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
};
