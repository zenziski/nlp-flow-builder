import {
  IsString,
  IsArray,
  IsOptional,
  IsMongoId,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateIntentDto {
  @ApiProperty()
  @IsMongoId()
  botId: string;

  @ApiProperty({ example: 'greeting' })
  @IsString()
  name: string;

  @ApiProperty({ type: [String], example: ['hello', 'hi there', 'good morning'] })
  @IsArray()
  examples: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  answers?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  entities?: string[];

  @ApiPropertyOptional({ example: 'pt' })
  @IsOptional()
  @IsString()
  language?: string;
}

export class UpdateIntentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  examples?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  answers?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  entities?: string[];
}

export class CreateEntityDto {
  @ApiProperty()
  @IsMongoId()
  botId: string;

  @ApiProperty({ example: 'city' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ enum: ['enum', 'regex', 'trim'], default: 'enum' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  values?: { value: string; synonyms: string[] }[];
}

export class ProcessTextDto {
  @ApiProperty({ example: 'hello there' })
  @IsString()
  text: string;

  @ApiPropertyOptional({ example: 'pt' })
  @IsOptional()
  @IsString()
  language?: string;
}
