import { create } from 'zustand';
import type { Intent } from '../types/nlp.types';
import { nlpService } from '../services/nlp.service';

interface NlpStore {
  intentsByBot: Record<string, Intent[]>;
  loadingByBot: Record<string, boolean>;
  fetchIntents: (botId: string) => Promise<void>;
}

export const useNlpStore = create<NlpStore>((set, get) => ({
  intentsByBot: {},
  loadingByBot: {},

  fetchIntents: async (botId: string) => {
    const { intentsByBot, loadingByBot } = get();

    // Already cached or currently loading — skip
    if (intentsByBot[botId] !== undefined || loadingByBot[botId]) return;

    set((s) => ({ loadingByBot: { ...s.loadingByBot, [botId]: true } }));

    try {
      const intents = await nlpService.getIntents(botId);
      set((s) => ({
        intentsByBot: { ...s.intentsByBot, [botId]: intents },
        loadingByBot: { ...s.loadingByBot, [botId]: false },
      }));
    } catch {
      set((s) => ({ loadingByBot: { ...s.loadingByBot, [botId]: false } }));
    }
  },
}));
