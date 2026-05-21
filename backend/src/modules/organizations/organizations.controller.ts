import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OrganizationsService } from './organizations.service';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';

@ApiTags('Organizations')
@ApiBearerAuth()
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly orgsService: OrganizationsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user organization and membership' })
  getMyOrg(@CurrentUser() user: any) {
    return this.orgsService.getMyOrganization(
      user._id.toString(),
      user.organizationId,
    );
  }

  @Get('members')
  @ApiOperation({ summary: 'List all members of the organization' })
  getMembers(@CurrentUser() user: any) {
    return this.orgsService.getMembers(user.organizationId, user._id.toString());
  }

  @Post('members/invite')
  @ApiOperation({ summary: 'Invite a new member (admin/owner only)' })
  invite(@Body() dto: InviteMemberDto, @CurrentUser() user: any) {
    return this.orgsService.inviteMember(
      user.organizationId,
      dto,
      user._id.toString(),
    );
  }

  @Patch('members/:id')
  @ApiOperation({ summary: 'Update member role or permissions (admin/owner only)' })
  updateMember(
    @Param('id') id: string,
    @Body() dto: UpdateMemberDto,
    @CurrentUser() user: any,
  ) {
    return this.orgsService.updateMember(
      user.organizationId,
      id,
      dto,
      user._id.toString(),
    );
  }

  @Delete('members/:id')
  @ApiOperation({ summary: 'Remove a member (admin/owner only)' })
  removeMember(@Param('id') id: string, @CurrentUser() user: any) {
    return this.orgsService.removeMember(
      user.organizationId,
      id,
      user._id.toString(),
    );
  }

  @Get('invite/:token')
  @Public()
  @ApiOperation({ summary: 'Get invite info by token (public)' })
  getInviteInfo(@Param('token') token: string) {
    return this.orgsService.getInviteInfo(token);
  }

  @Post('accept-invite')
  @Public()
  @ApiOperation({ summary: 'Accept an invite and create or link account (public)' })
  acceptInvite(@Body() dto: AcceptInviteDto) {
    return this.orgsService.acceptInvite(dto);
  }
}
