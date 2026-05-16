import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NodesController } from './nodes.controller';
import { NodesService } from './nodes.service';
import { Flow, FlowSchema } from '../flows/schemas/flow.schema';
import { FlowsModule } from '../flows/flows.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Flow.name, schema: FlowSchema }]),
    FlowsModule,
  ],
  controllers: [NodesController],
  providers: [NodesService],
  exports: [NodesService],
})
export class NodesModule {}
