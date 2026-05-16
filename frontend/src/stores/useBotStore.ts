import { create } from 'zustand';
import type { Bot, CreateBotDto, UpdateBotDto } from '../types/bot.types';
import { botsService } from '../services/bots.service';

interface BotStore {
  bots: Bot[];
  activeBotId: string | null;
  activeBot: Bot | null;
  isLoading: boolean;
  fetchBots: () => Promise<void>;
  setActiveBot: (id: string) => void;
  createBot: (dto: CreateBotDto) => Promise<Bot>;
  updateBot: (id: string, dto: UpdateBotDto) => Promise<void>;
  deleteBot: (id: string) => Promise<void>;
}

export const useBotStore = create<BotStore>((set, get) => ({
  bots: [],
  activeBotId: null,
  activeBot: null,
  isLoading: false,

  fetchBots: async () => {
    set({ isLoading: true });
    try {
      const bots = await botsService.findAll();
      set({ bots });
    } finally {
      set({ isLoading: false });
    }
  },

  setActiveBot: (id) => {
    const bot = get().bots.find((b) => b._id === id) ?? null;
    set({ activeBotId: id, activeBot: bot });
  },

  createBot: async (dto) => {
    const bot = await botsService.create(dto);
    set((state) => ({ bots: [bot, ...state.bots] }));
    return bot;
  },

  updateBot: async (id, dto) => {
    const updated = await botsService.update(id, dto);
    set((state) => ({
      bots: state.bots.map((b) => (b._id === id ? updated : b)),
      activeBot: state.activeBotId === id ? updated : state.activeBot,
    }));
  },

  deleteBot: async (id) => {
    await botsService.remove(id);
    set((state) => ({
      bots: state.bots.filter((b) => b._id !== id),
      activeBotId: state.activeBotId === id ? null : state.activeBotId,
      activeBot: state.activeBotId === id ? null : state.activeBot,
    }));
  },
}));
