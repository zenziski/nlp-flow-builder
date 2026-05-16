import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VariablesController } from './variables.controller';
import { VariablesService } from './variables.service';
import { Variable, VariableSchema } from './schemas/variable.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Variable.name, schema: VariableSchema }])],
  controllers: [VariablesController],
  providers: [VariablesService],
  exports: [VariablesService],
})
export class VariablesModule {}
