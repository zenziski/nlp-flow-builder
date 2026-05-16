import { Injectable } from '@nestjs/common';

// NLP.js manager cache — one manager per bot, keyed by botId
@Injectable()
export class NlpManagerProvider {
  private managers = new Map<string, any>();
  private trained = new Set<string>();

  async getOrCreate(botId: string, languages: string[]): Promise<any> {
    if (!this.managers.has(botId)) {
      const { NlpManager } = await import('node-nlp');
      const manager = new NlpManager({ languages, forceNER: true, autoSave: false, autoLoad: false });
      this.managers.set(botId, manager);
    }
    return this.managers.get(botId);
  }

  invalidate(botId: string): void {
    this.managers.delete(botId);
    this.trained.delete(botId);
  }

  isTrained(botId: string): boolean {
    return this.trained.has(botId);
  }

  markTrained(botId: string): void {
    this.trained.add(botId);
  }
}
