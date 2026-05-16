import api from './api.client';
import type { CreateFlowDto, SaveCanvasDto } from '../types/flow.types';

export const flowsService = {
  async findAll(botId: string) {
    const res = await api.get('/flows', { params: { botId } });
    return res.data.data;
  },
  async findOne(id: string) {
    const res = await api.get(`/flows/${id}`);
    return res.data.data;
  },
  async create(dto: CreateFlowDto) {
    const res = await api.post('/flows', dto);
    return res.data.data;
  },
  async update(id: string, dto: Partial<CreateFlowDto>) {
    const res = await api.patch(`/flows/${id}`, dto);
    return res.data.data;
  },
  async saveCanvas(id: string, dto: SaveCanvasDto) {
    const res = await api.post(`/flows/${id}/canvas`, dto);
    return res.data.data;
  },
  async publish(id: string) {
    const res = await api.post(`/flows/${id}/publish`);
    return res.data.data;
  },
  async duplicate(id: string) {
    const res = await api.post(`/flows/${id}/duplicate`);
    return res.data.data;
  },
  async exportJson(id: string) {
    const res = await api.get(`/flows/${id}/export`);
    return res.data.data;
  },
  async importJson(botId: string, data: any) {
    const res = await api.post(`/flows/import`, data, { params: { botId } });
    return res.data.data;
  },
  async validate(id: string) {
    const res = await api.get(`/flows/${id}/validate`);
    return res.data.data;
  },
  async remove(id: string) {
    const res = await api.delete(`/flows/${id}`);
    return res.data.data;
  },
};
