import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Intent, IntentDocument } from './schemas/intent.schema';
import { Entity, EntityDocument } from './schemas/entity.schema';
import { Bot, BotDocument } from '../bots/schemas/bot.schema';
import { NlpManagerProvider } from './nlp-manager.provider';
import {
  CreateIntentDto,
  UpdateIntentDto,
  CreateEntityDto,
  ProcessTextDto,
} from './dto/nlp.dto';

export interface NlpResult {
  intent: string;
  score: number;
  entities: Array<{ entity: string; value: string; sourceText: string }>;
  answer?: string;
  sentiment?: { score: number; vote: string };
  utterance: string;
  language: string;
}

@Injectable()
export class NlpService {
  private readonly logger = new Logger(NlpService.name);
  private retrainTimers = new Map<string, NodeJS.Timeout>();

  constructor(
    @InjectModel(Intent.name) private intentModel: Model<IntentDocument>,
    @InjectModel(Entity.name) private entityModel: Model<EntityDocument>,
    @InjectModel(Bot.name) private botModel: Model<BotDocument>,
    private nlpProvider: NlpManagerProvider,
  ) {}

  async train(botId: string): Promise<{ message: string }> {
    const bot = await this.botModel.findById(botId).exec();
    if (!bot) throw new NotFoundException('Bot not found');

    this.nlpProvider.invalidate(botId);
    const languages = ['pt', 'en'];
    const manager = await this.nlpProvider.getOrCreate(botId, languages);

    const intents = await this.intentModel.find({ botId: new Types.ObjectId(botId) }).exec();
    const entities = await this.entityModel.find({ botId: new Types.ObjectId(botId) }).exec();

    for (const intent of intents) {
      const lang = intent.language ?? 'pt';
      for (const example of intent.examples) {
        manager.addDocument(lang, example, intent.name);
      }
      for (const answer of intent.answers ?? []) {
        manager.addAnswer(lang, intent.name, answer);
      }
    }

    for (const entity of entities) {
      if (entity.type === 'enum') {
        for (const item of entity.values ?? []) {
          manager.addNamedEntityText(entity.name, item.value, languages, item.synonyms ?? []);
        }
      }
    }

    await manager.train();
    this.nlpProvider.markTrained(botId);
    return { message: 'Training complete' };
  }

  async process(botId: string, dto: ProcessTextDto): Promise<NlpResult> {
    const bot = await this.botModel.findById(botId).exec();
    if (!bot) throw new NotFoundException('Bot not found');

    if (!this.nlpProvider.isTrained(botId)) {
      await this.train(botId);
    }

    const manager = await this.nlpProvider.getOrCreate(botId, ['pt', 'en']);
    const lang = dto.language ?? bot.language ?? 'pt';
    const result = await manager.process(lang, dto.text);

    this.logger.log(
      `[NLP] botId=${botId} | utterance="${dto.text}" | lang=${result.locale ?? lang}` +
      ` | intent=${result.intent ?? 'None'} | score=${(result.score ?? 0).toFixed(4)}` +
      ` | entities=${JSON.stringify((result.entities ?? []).map((e: any) => ({ entity: e.entity, value: e.option ?? e.utteranceText })))}` +
      ` | sentiment=${result.sentiment ? `${result.sentiment.vote}(${result.sentiment.score.toFixed(3)})` : 'n/a'}`,
    );

    return {
      intent: result.intent ?? 'None',
      score: result.score ?? 0,
      entities: (result.entities ?? []).map((e: any) => ({
        entity: e.entity,
        value: e.option ?? e.utteranceText,
        sourceText: e.utteranceText,
      })),
      answer: result.answer,
      sentiment: result.sentiment
        ? { score: result.sentiment.score, vote: result.sentiment.vote }
        : undefined,
      utterance: result.utterance ?? dto.text,
      language: result.locale ?? lang,
    };
  }

  async getIntents(botId: string) {
    return this.intentModel.find({ botId: new Types.ObjectId(botId) }).sort({ name: 1 }).exec();
  }

  async createIntent(dto: CreateIntentDto) {
    const intent = await this.intentModel.create({
      ...dto,
      botId: new Types.ObjectId(dto.botId),
      language: dto.language ?? 'pt',
    });
    this.scheduleRetrain(dto.botId);
    return intent;
  }

  async updateIntent(id: string, dto: UpdateIntentDto) {
    const intent = await this.intentModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!intent) throw new NotFoundException('Intent not found');
    this.scheduleRetrain(intent.botId.toString());
    return intent;
  }

  async deleteIntent(id: string) {
    const intent = await this.intentModel.findByIdAndDelete(id).exec();
    if (!intent) throw new NotFoundException('Intent not found');
    this.scheduleRetrain(intent.botId.toString());
    return { deleted: true };
  }

  async getEntities(botId: string) {
    return this.entityModel.find({ botId: new Types.ObjectId(botId) }).sort({ name: 1 }).exec();
  }

  async createEntity(dto: CreateEntityDto) {
    const entity = await this.entityModel.create({
      ...dto,
      botId: new Types.ObjectId(dto.botId),
    });
    this.scheduleRetrain(dto.botId);
    return entity;
  }

  async updateEntity(id: string, dto: Partial<CreateEntityDto>) {
    const entity = await this.entityModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!entity) throw new NotFoundException('Entity not found');
    this.scheduleRetrain(entity.botId.toString());
    return entity;
  }

  async deleteEntity(id: string) {
    const entity = await this.entityModel.findByIdAndDelete(id).exec();
    if (!entity) throw new NotFoundException('Entity not found');
    this.scheduleRetrain(entity.botId.toString());
    return { deleted: true };
  }

  private scheduleRetrain(botId: string) {
    const existing = this.retrainTimers.get(botId);
    if (existing) clearTimeout(existing);
    const timer = setTimeout(() => {
      this.train(botId).catch((err) =>
        console.error(`Auto-retrain failed for bot ${botId}:`, err),
      );
      this.retrainTimers.delete(botId);
    }, 2000);
    this.retrainTimers.set(botId, timer);
  }
}
