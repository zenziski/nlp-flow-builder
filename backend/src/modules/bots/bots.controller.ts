import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BotsService } from './bots.service';
import { CreateBotDto } from './dto/create-bot.dto';
import { UpdateBotDto } from './dto/update-bot.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

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
}
