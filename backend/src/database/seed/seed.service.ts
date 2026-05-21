import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { User, UserDocument } from '../../modules/auth/schemas/user.schema';
import { Bot, BotDocument } from '../../modules/bots/schemas/bot.schema';
import { Flow, FlowDocument } from '../../modules/flows/schemas/flow.schema';
import { Intent, IntentDocument } from '../../modules/nlp/schemas/intent.schema';
import {
  ConversationSession,
  ConversationSessionDocument,
} from '../../modules/runtime/schemas/conversation-session.schema';
import {
  Organization,
  OrganizationDocument,
} from '../../modules/organizations/schemas/organization.schema';
import {
  OrganizationMember,
  OrganizationMemberDocument,
  MemberRole,
  InviteStatus,
} from '../../modules/organizations/schemas/organization-member.schema';
import { exampleFlow } from './seed-data/example-flow.seed';
import { analyticsBotFlow, analyticsIntents } from './seed-data/analytics-bot-flow.seed';
import { generateAnalyticsSessions } from './seed-data/analytics-sessions.seed';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Bot.name) private botModel: Model<BotDocument>,
    @InjectModel(Flow.name) private flowModel: Model<FlowDocument>,
    @InjectModel(Intent.name) private intentModel: Model<IntentDocument>,
    @InjectModel(ConversationSession.name)
    private sessionModel: Model<ConversationSessionDocument>,
    @InjectModel(Organization.name) private orgModel: Model<OrganizationDocument>,
    @InjectModel(OrganizationMember.name)
    private memberModel: Model<OrganizationMemberDocument>,
    private config: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    const shouldSeed = this.config.get<string>('SEED_ON_STARTUP') === 'true';
    if (!shouldSeed) return;

    const userCount = await this.userModel.countDocuments();
    if (userCount > 0) {
      this.logger.log('Seed skipped — data already exists');
      return;
    }

    this.logger.log('Seeding initial data...');
    await this.seed();
    this.logger.log('Seed complete');
  }

  async seed() {
    const hashed = await bcrypt.hash('admin123', 12);
    const user = await this.userModel.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashed,
      role: 'admin',
    });

    // Create the organization for the seed user
    const org = await this.orgModel.create({
      name: "Admin User's Workspace",
      ownerId: user._id,
    });
    await this.memberModel.create({
      organizationId: org._id,
      userId: user._id,
      inviteEmail: 'admin@example.com',
      inviteStatus: InviteStatus.ACCEPTED,
      role: MemberRole.OWNER,
      permissions: { pages: [], bots: [] },
    });
    await this.userModel.updateOne({ _id: user._id }, { organizationId: org._id });

    const bot = await this.botModel.create({
      name: 'Customer Support Bot',
      description: 'Demo bot for customer support',
      language: 'pt',
      createdBy: user._id,
      organizationId: org._id,
      clientId: randomBytes(16).toString('hex'),
      clientSecret: randomBytes(32).toString('hex'),
      settings: {
        confidenceThreshold: 0.6,
        fallbackMessage: 'Desculpe, não entendi. Pode reformular?',
        welcomeMessage: 'Olá! Como posso te ajudar hoje?',
      },
    });

    await this.intentModel.insertMany([
      {
        botId: bot._id,
        name: 'greeting',
        examples: ['olá', 'oi', 'bom dia', 'boa tarde', 'hello', 'hi'],
        answers: ['Olá! Como posso te ajudar?', 'Oi! Em que posso ser útil?'],
        language: 'pt',
      },
      {
        botId: bot._id,
        name: 'order_status',
        examples: ['qual o status do meu pedido', 'onde está meu pedido', 'rastrear pedido'],
        answers: ['Vou verificar o status do seu pedido. Por favor, informe o número.'],
        language: 'pt',
      },
      {
        botId: bot._id,
        name: 'cancel_order',
        examples: ['quero cancelar meu pedido', 'cancelar pedido', 'não quero mais o pedido'],
        answers: ['Lamento que queira cancelar. Posso ajudar com o processo.'],
        language: 'pt',
      },
      {
        botId: bot._id,
        name: 'farewell',
        examples: ['tchau', 'até logo', 'obrigado', 'até mais', 'bye'],
        answers: ['Até logo! Foi um prazer ajudar!', 'Tchau! Volte sempre!'],
        language: 'pt',
      },
    ]);

    await this.flowModel.create({
      ...exampleFlow,
      botId: bot._id,
      isDefault: true,
    });

    // ── Analytics bot ──────────────────────────────────────────────────────
    const analyticsBot = await this.botModel.create({
      name: 'E-commerce Assistant',
      description: 'Full e-commerce support bot with analytics data for testing',
      language: 'pt',
      createdBy: user._id,
      organizationId: org._id,
      clientId: randomBytes(16).toString('hex'),
      clientSecret: randomBytes(32).toString('hex'),
      settings: {
        confidenceThreshold: 0.55,
        fallbackMessage: 'Desculpe, não entendi. Pode reformular?',
        welcomeMessage: 'Olá! Bem-vindo à nossa loja online. Como posso te ajudar?',
      },
    });

    await this.intentModel.insertMany(
      analyticsIntents.map((intent) => ({ ...intent, botId: analyticsBot._id })),
    );

    const analyticsFlow = await this.flowModel.create({
      ...analyticsBotFlow,
      botId: analyticsBot._id,
      isDefault: true,
    });

    const sessions = generateAnalyticsSessions(
      analyticsBot._id as any,
      analyticsFlow._id as any,
    );
    await this.sessionModel.insertMany(sessions);

    this.logger.log(`Inserted ${sessions.length} analytics sessions`);

    return { user, bot, analyticsBot };
  }
}
