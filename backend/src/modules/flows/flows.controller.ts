import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FlowsService } from './flows.service';
import { CreateFlowDto } from './dto/create-flow.dto';
import { UpdateFlowDto, SaveCanvasDto, ImportFlowDto } from './dto/update-flow.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Flows')
@ApiBearerAuth()
@Controller('flows')
export class FlowsController {
  constructor(private readonly flowsService: FlowsService) {}

  @Get()
  @ApiQuery({ name: 'botId', required: true })
  @ApiOperation({ summary: 'List all flows for a bot' })
  findAll(@Query('botId') botId: string, @CurrentUser() user: any) {
    return this.flowsService.findAll(botId, user._id.toString());
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.flowsService.findOne(id, user._id.toString());
  }

  @Post()
  create(@Body() dto: CreateFlowDto, @CurrentUser() user: any) {
    return this.flowsService.create(dto, user._id.toString());
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFlowDto, @CurrentUser() user: any) {
    return this.flowsService.update(id, dto, user._id.toString());
  }

  @Post(':id/canvas')
  @ApiOperation({ summary: 'Save canvas nodes and edges' })
  saveCanvas(@Param('id') id: string, @Body() dto: SaveCanvasDto, @CurrentUser() user: any) {
    return this.flowsService.saveCanvas(id, dto, user._id.toString());
  }

  @Post(':id/publish')
  publish(@Param('id') id: string, @CurrentUser() user: any) {
    return this.flowsService.publish(id, user._id.toString());
  }

  @Post(':id/duplicate')
  duplicate(@Param('id') id: string, @CurrentUser() user: any) {
    return this.flowsService.duplicate(id, user._id.toString());
  }

  @Get(':id/export')
  exportJson(@Param('id') id: string, @CurrentUser() user: any) {
    return this.flowsService.exportJson(id, user._id.toString());
  }

  @Post(':id/import')
  @ApiQuery({ name: 'botId', required: true })
  importJson(
    @Query('botId') botId: string,
    @Body() dto: ImportFlowDto,
    @CurrentUser() user: any,
  ) {
    return this.flowsService.importJson(botId, dto, user._id.toString());
  }

  @Get(':id/validate')
  validate(@Param('id') id: string, @CurrentUser() user: any) {
    return this.flowsService.validate(id, user._id.toString());
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.flowsService.remove(id, user._id.toString());
  }
}
