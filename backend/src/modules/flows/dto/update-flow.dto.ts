import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFlowDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class SaveCanvasDto {
  @ApiPropertyOptional()
  @IsArray()
  nodes: any[];

  @ApiPropertyOptional()
  @IsArray()
  edges: any[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  startNodeId?: string;
}

export class ImportFlowDto {
  @ApiPropertyOptional()
  name: string;
  nodes: any[];
  edges: any[];
  startNodeId?: string;
  description?: string;
}
