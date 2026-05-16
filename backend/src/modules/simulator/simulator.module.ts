import { Module } from '@nestjs/common';
import { SimulatorGateway } from './simulator.gateway';
import { RuntimeModule } from '../runtime/runtime.module';

@Module({
  imports: [RuntimeModule],
  providers: [SimulatorGateway],
})
export class SimulatorModule {}
