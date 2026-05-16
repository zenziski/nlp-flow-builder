import { IsString, IsOptional, IsObject, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NodeType } from '../../flows/schemas/flow.schema';

export class CreateNodeDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  type: NodeType;

  @ApiProperty()
  @IsObject()
  position: { x: number; y: number };

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;
}

export class UpdateNodeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  position?: { x: number; y: number };

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;
}
