import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AcceptInviteDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiPropertyOptional({ description: 'Required when creating a new account' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Required when creating a new account (min 8 chars)' })
  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;
}
