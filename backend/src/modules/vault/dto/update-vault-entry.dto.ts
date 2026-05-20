import { IsString, IsOptional, IsIn, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateVaultEntryDto {
  @ApiPropertyOptional({ example: 'sk-new-value' })
  @IsOptional()
  @IsString()
  @MaxLength(4096)
  value?: string;

  @ApiPropertyOptional({ enum: ['normal', 'sensitive'] })
  @IsOptional()
  @IsIn(['normal', 'sensitive'])
  type?: 'normal' | 'sensitive';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
