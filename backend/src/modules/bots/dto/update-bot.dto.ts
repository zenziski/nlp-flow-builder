import { PartialType } from '@nestjs/swagger';
import { CreateBotDto } from './create-bot.dto';
import { IsOptional, IsObject, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBotDto extends PartialType(CreateBotDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  settings?: {
    confidenceThreshold?: number;
    fallbackMessage?: string;
    welcomeMessage?: string;
    sessionTimeoutMinutes?: number;
  };
}
