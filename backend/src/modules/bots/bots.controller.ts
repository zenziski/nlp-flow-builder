import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { BotsService } from './bots.service';
import { CreateBotDto } from './dto/create-bot.dto';
import { UpdateBotDto } from './dto/update-bot.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

class SetMainFlowDto {
  @IsString() @IsOptional()
  flowId?: string | null;
}

@ApiTags('Bots')
@ApiBearerAuth()
@Controller('bots')
export class BotsController {
  constructor(private readonly botsService: BotsService) {}

  @Get()
  @ApiOperation({ summary: 'List all bots for current user' })
  findAll(@CurrentUser() user: any) {
    return this.botsService.findAll(user._id.toString());
  }

  @Get('usage-overview')
  @ApiOperation({ summary: 'Get aggregated usage across all bots for current user' })
  getUsageOverview(@CurrentUser() user: any) {
    return this.botsService.getUsageOverview(user._id.toString());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a bot by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.botsService.findOne(id, user._id.toString());
  }

  @Post()
  @ApiOperation({ summary: 'Create a new bot' })
  create(@Body() dto: CreateBotDto, @CurrentUser() user: any) {
    return this.botsService.create(dto, user._id.toString());
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a bot' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBotDto,
    @CurrentUser() user: any,
  ) {
    return this.botsService.update(id, dto, user._id.toString());
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a bot' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.botsService.remove(id, user._id.toString());
  }

  @Post(':id/regenerate-secret')
  @ApiOperation({ summary: 'Regenerate the Runtime API client secret for a bot' })
  regenerateSecret(@Param('id') id: string, @CurrentUser() user: any) {
    return this.botsService.regenerateSecret(id, user._id.toString());
  }

  @Patch(':id/main-flow')
  @ApiOperation({ summary: 'Set (or clear) the main flow for a bot' })
  setMainFlow(
    @Param('id') id: string,
    @Body() dto: SetMainFlowDto,
    @CurrentUser() user: any,
  ) {
    return this.botsService.setMainFlow(id, dto.flowId ?? null, user._id.toString());
  }

  @Get(':id/usage')
  @ApiOperation({ summary: 'Get session/message usage stats for a bot' })
  getUsage(@Param('id') id: string, @CurrentUser() user: any) {
    return this.botsService.getUsage(id, user._id.toString());
  }

  @Get(':id/usage/detailed')
  @ApiOperation({ summary: 'Get detailed analytics for a specific bot' })
  getDetailedUsage(@Param('id') id: string, @CurrentUser() user: any) {
    return this.botsService.getDetailedUsage(id, user._id.toString());
  }

  @Get(':id/usage/path-analysis')
  @ApiOperation({ summary: 'Get user path / flow traversal analysis for a bot' })
  getPathAnalysis(@Param('id') id: string, @CurrentUser() user: any) {
    return this.botsService.getPathAnalysis(id, user._id.toString());
  }

  @Get(':id/sessions')
  @ApiOperation({ summary: 'List real conversation sessions for a bot' })
  getSessions(@Param('id') id: string, @CurrentUser() user: any) {
    return this.botsService.getSessions(id, user._id.toString());
  }

  @Get(':id/sessions/:sessionId')
  @ApiOperation({ summary: 'Get full conversation history for a session' })
  getSession(
    @Param('id') id: string,
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: any,
  ) {
    return this.botsService.getSession(id, sessionId, user._id.toString());
  }
}
