import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { VariablesService } from './variables.service';

@ApiTags('Variables')
@ApiBearerAuth()
@Controller('variables')
export class VariablesController {
  constructor(private readonly variablesService: VariablesService) {}

  @Get()
  @ApiQuery({ name: 'botId', required: true })
  findAll(@Query('botId') botId: string) {
    return this.variablesService.findAll(botId);
  }

  @Post()
  create(@Body() dto: any) {
    const { botId, ...rest } = dto;
    return this.variablesService.create(botId, rest);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.variablesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.variablesService.remove(id);
  }
}
