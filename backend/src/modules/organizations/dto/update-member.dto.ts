import { IsEnum, IsOptional, IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MemberRole } from '../schemas/organization-member.schema';
import { ApiPropertyOptional } from '@nestjs/swagger';

class PermissionsDto {
  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  pages?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  bots?: string[];
}

export class UpdateMemberDto {
  @ApiPropertyOptional({ enum: [MemberRole.ADMIN, MemberRole.MEMBER] })
  @IsEnum([MemberRole.ADMIN, MemberRole.MEMBER])
  @IsOptional()
  role?: MemberRole;

  @ApiPropertyOptional({ type: PermissionsDto })
  @ValidateNested()
  @Type(() => PermissionsDto)
  @IsOptional()
  permissions?: PermissionsDto;
}
