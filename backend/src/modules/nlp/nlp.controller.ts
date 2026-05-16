import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { NlpService } from './nlp.service';
import {
  CreateIntentDto,
  UpdateIntentDto,
  CreateEntityDto,
  ProcessTextDto,
} from './dto/nlp.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('NLP')
@ApiBearerAuth()
@Controller('nlp')
export class NlpController {
  constructor(private readonly nlpService: NlpService) {}

  @Get('intents')
  @ApiQuery({ name: 'botId', required: true })
  getIntents(@Query('botId') botId: string) {
    return this.nlpService.getIntents(botId);
  }

  @Post('intents')
  createIntent(@Body() dto: CreateIntentDto) {
    return this.nlpService.createIntent(dto);
  }

  @Patch('intents/:id')
  updateIntent(@Param('id') id: string, @Body() dto: UpdateIntentDto) {
    return this.nlpService.updateIntent(id, dto);
  }

  @Delete('intents/:id')
  deleteIntent(@Param('id') id: string) {
    return this.nlpService.deleteIntent(id);
  }

  @Get('entities')
  @ApiQuery({ name: 'botId', required: true })
  getEntities(@Query('botId') botId: string) {
    return this.nlpService.getEntities(botId);
  }

  @Post('entities')
  createEntity(@Body() dto: CreateEntityDto) {
    return this.nlpService.createEntity(dto);
  }

  @Patch('entities/:id')
  updateEntity(@Param('id') id: string, @Body() dto: Partial<CreateEntityDto>) {
    return this.nlpService.updateEntity(id, dto);
  }

  @Delete('entities/:id')
  deleteEntity(@Param('id') id: string) {
    return this.nlpService.deleteEntity(id);
  }

  @Post('train/:botId')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Trigger NLP training for a bot (async)' })
  train(@Param('botId') botId: string) {
    this.nlpService.train(botId).catch((err) =>
      console.error('Training error:', err),
    );
    return { message: 'Training started', status: 'accepted' };
  }

  @Post('process/:botId')
  @ApiOperation({ summary: 'Process text through NLP' })
  process(@Param('botId') botId: string, @Body() dto: ProcessTextDto) {
    return this.nlpService.process(botId, dto);
  }
}
