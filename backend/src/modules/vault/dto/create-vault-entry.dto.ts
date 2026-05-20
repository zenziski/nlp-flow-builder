import { IsString, IsOptional, IsIn, Matches, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVaultEntryDto {
  @ApiProperty({ example: 'OPENAI_API_KEY' })
  @IsString()
  @Matches(/^[a-zA-Z_][a-zA-Z0-9_]*$/, {
    message: 'Key must start with a letter or underscore and contain only letters, numbers, and underscores',
  })
  @MaxLength(100)
  key: string;

  @ApiProperty({ example: 'sk-...' })
  @IsString()
  @MaxLength(4096)
  value: string;

  @ApiPropertyOptional({ enum: ['normal', 'sensitive'], default: 'normal' })
  @IsOptional()
  @IsIn(['normal', 'sensitive'])
  type?: 'normal' | 'sensitive';

  @ApiPropertyOptional({ example: 'OpenAI API key for GPT integrations' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
