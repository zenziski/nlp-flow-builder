import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { BotsModule } from './modules/bots/bots.module';
import { FlowsModule } from './modules/flows/flows.module';
import { NodesModule } from './modules/nodes/nodes.module';
import { NlpModule } from './modules/nlp/nlp.module';
import { RuntimeModule } from './modules/runtime/runtime.module';
import { SimulatorModule } from './modules/simulator/simulator.module';
import { VariablesModule } from './modules/variables/variables.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { VaultModule } from './modules/vault/vault.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { BillingModule } from './modules/billing/billing.module';
import { SeedModule } from './database/seed/seed.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    ScheduleModule.forRoot(),
    DatabaseModule,
    AuthModule,
    OrganizationsModule,
    BotsModule,
    FlowsModule,
    NodesModule,
    NlpModule,
    RuntimeModule,
    SimulatorModule,
    VariablesModule,
    IntegrationsModule,
    VaultModule,
    BillingModule,
    SeedModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
