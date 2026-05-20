import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { VaultService } from './vault.service';
import { CreateVaultEntryDto } from './dto/create-vault-entry.dto';
import { UpdateVaultEntryDto } from './dto/update-vault-entry.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Vault')
@ApiBearerAuth()
@Controller('vault')
export class VaultController {
  constructor(private readonly vaultService: VaultService) {}

  @Get()
  @ApiOperation({ summary: 'List all vault entries for the current user' })
  findAll(@CurrentUser() user: any) {
    return this.vaultService.findAll(user._id.toString());
  }

  @Post()
  @ApiOperation({ summary: 'Create a new vault entry' })
  create(@Body() dto: CreateVaultEntryDto, @CurrentUser() user: any) {
    return this.vaultService.create(user._id.toString(), dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a vault entry' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateVaultEntryDto,
    @CurrentUser() user: any,
  ) {
    return this.vaultService.update(id, user._id.toString(), dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a vault entry' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.vaultService.remove(id, user._id.toString());
  }
}
