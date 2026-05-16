import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RuntimeService } from './runtime.service';
import { RuntimeController } from './runtime.controller';
import { SessionService } from './session.service';
import {
  ConversationSession,
  ConversationSessionSchema,
} from './schemas/conversation-session.schema';
import { Flow, FlowSchema } from '../flows/schemas/flow.schema';
import { Bot, BotSchema } from '../bots/schemas/bot.schema';
import { NlpModule } from '../nlp/nlp.module';
import { NodeExecutorRegistry } from '../../engine/node-executor.registry';
import { NodeExecutorFactory } from '../../engine/node-executor.factory';
import { StartNodeExecutor } from '../../engine/executors/start.executor';
import { EndNodeExecutor } from '../../engine/executors/end.executor';
import { MessageNodeExecutor } from '../../engine/executors/message.executor';
import { InputNodeExecutor } from '../../engine/executors/input.executor';
import { IntentNodeExecutor } from '../../engine/executors/intent.executor';
import { ConditionNodeExecutor } from '../../engine/executors/condition.executor';
import { SwitchNodeExecutor } from '../../engine/executors/switch.executor';
import { DelayNodeExecutor } from '../../engine/executors/delay.executor';
import { ApiNodeExecutor } from '../../engine/executors/api.executor';
import { VariableNodeExecutor } from '../../engine/executors/variable.executor';
import { RedirectNodeExecutor } from '../../engine/executors/redirect.executor';
import { RandomNodeExecutor } from '../../engine/executors/random.executor';
import { SubflowNodeExecutor } from '../../engine/executors/subflow.executor';

function createRegistryProvider() {
  return {
    provide: NodeExecutorRegistry,
    useFactory: () => {
      const registry = new NodeExecutorRegistry();
      registry.register('startNode', StartNodeExecutor);
      registry.register('endNode', EndNodeExecutor);
      registry.register('messageNode', MessageNodeExecutor);
      registry.register('inputNode', InputNodeExecutor);
      registry.register('intentNode', IntentNodeExecutor as any);
      registry.register('conditionNode', ConditionNodeExecutor);
      registry.register('switchNode', SwitchNodeExecutor);
      registry.register('delayNode', DelayNodeExecutor);
      registry.register('apiNode', ApiNodeExecutor);
      registry.register('variableNode', VariableNodeExecutor);
      registry.register('redirectNode', RedirectNodeExecutor);
      registry.register('randomNode', RandomNodeExecutor);
      registry.register('subflowNode', SubflowNodeExecutor);
      return registry;
    },
  };
}

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ConversationSession.name, schema: ConversationSessionSchema },
      { name: Flow.name, schema: FlowSchema },
      { name: Bot.name, schema: BotSchema },
    ]),
    NlpModule,
  ],
  providers: [
    RuntimeService,
    SessionService,
    createRegistryProvider(),
    NodeExecutorFactory,
  ],
  controllers: [RuntimeController],
  exports: [RuntimeService, SessionService, MongooseModule],
})
export class RuntimeModule {}
