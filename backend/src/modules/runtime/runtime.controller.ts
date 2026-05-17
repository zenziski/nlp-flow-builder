import {
  Controller,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { RuntimeService } from './runtime.service';
import { BotsService } from '../bots/bots.service';
import { Public } from '../../common/decorators/public.decorator';

class StartSessionDto {
  @IsString() @IsNotEmpty()
  clientId: string;

  @IsString() @IsNotEmpty()
  clientSecret: string;

  @IsString() @IsOptional()
  userId?: string;
}

class SendMessageDto {
  @IsString() @IsNotEmpty()
  text: string;
}

@ApiTags('Runtime API')
@Public()
@Controller('api/conversation')
export class RuntimeController {
  constructor(
    private readonly runtimeService: RuntimeService,
    private readonly botsService: BotsService,
  ) {}

  /**
   * Start a new conversation session.
   * Authenticates via clientId + clientSecret obtained from the bot's configuration page.
   * Returns a sessionId to be used in subsequent message calls.
   */
  @Post('start')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start a new conversation session' })
  @ApiResponse({
    status: 200,
    description: 'Session started. Use sessionId to send messages.',
  })
  async start(@Body() dto: StartSessionDto) {
    if (!dto.clientId || !dto.clientSecret) {
      throw new BadRequestException('clientId and clientSecret are required');
    }
    const bot = await this.botsService.findByClientCredentials(dto.clientId, dto.clientSecret);
    if (!bot.mainFlowId) {
      throw new BadRequestException(
        'This bot has no main flow configured. Set one in the bot configuration page.',
      );
    }
    const userId = dto.userId ?? `anon_${Date.now()}`;
    const response = await this.runtimeService.startSession(bot._id.toString(), bot.mainFlowId.toString(), userId);
    return {
      sessionId: response.sessionId,
      ...this.formatResponse(response),
    };
  }

  /**
   * Send a message to an active session.
   */
  @Post(':sessionId/message')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a message to an active session' })
  async sendMessage(
    @Param('sessionId') sessionId: string,
    @Body() dto: SendMessageDto,
  ) {
    const response = await this.runtimeService.processMessage(sessionId, dto.text);
    return this.formatResponse(response);
  }

  private formatResponse(response: any) {
    return {
      outputs: (response.outputs ?? [])
        .filter((o: any) => o.type === 'text')
        .map((o: any) => ({ type: o.type, content: o.content })),
      waitForInput: response.waitForInput,
      sessionEnded: response.sessionEnded,
      variables: response.variables,
    };
  }
}
