import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NodesService } from './nodes.service';
import { CreateNodeDto, UpdateNodeDto } from './dto/node.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Nodes')
@ApiBearerAuth()
@Controller('flows/:flowId/nodes')
export class NodesController {
  constructor(private readonly nodesService: NodesService) {}

  @Get()
  findAll(@Param('flowId') flowId: string, @CurrentUser() user: any) {
    return this.nodesService.findAll(flowId, user._id.toString());
  }

  @Get(':nodeId')
  findOne(
    @Param('flowId') flowId: string,
    @Param('nodeId') nodeId: string,
    @CurrentUser() user: any,
  ) {
    return this.nodesService.findOne(flowId, nodeId, user._id.toString());
  }

  @Post()
  create(
    @Param('flowId') flowId: string,
    @Body() dto: CreateNodeDto,
    @CurrentUser() user: any,
  ) {
    return this.nodesService.create(flowId, dto, user._id.toString());
  }

  @Patch(':nodeId')
  update(
    @Param('flowId') flowId: string,
    @Param('nodeId') nodeId: string,
    @Body() dto: UpdateNodeDto,
    @CurrentUser() user: any,
  ) {
    return this.nodesService.update(flowId, nodeId, dto, user._id.toString());
  }

  @Delete(':nodeId')
  remove(
    @Param('flowId') flowId: string,
    @Param('nodeId') nodeId: string,
    @CurrentUser() user: any,
  ) {
    return this.nodesService.remove(flowId, nodeId, user._id.toString());
  }
}
