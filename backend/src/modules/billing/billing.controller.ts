import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { SavePaymentMethodDto } from './dto/save-payment-method.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Billing')
@ApiBearerAuth()
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  private requireOrg(user: any): string {
    if (!user?.organizationId) {
      throw new ForbiddenException('No organization associated with this account');
    }
    return user.organizationId as string;
  }

  @Get('payment-method')
  @ApiOperation({ summary: 'Get current payment method (masked)' })
  async getPaymentMethod(@CurrentUser() user: any) {
    const orgId = this.requireOrg(user);
    return this.billingService.getPaymentMethod(orgId);
  }

  @Post('payment-method')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add or replace credit card payment method' })
  async savePaymentMethod(
    @CurrentUser() user: any,
    @Body() dto: SavePaymentMethodDto,
    @Req() req: Request,
  ) {
    const orgId = this.requireOrg(user);
    const remoteIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      '127.0.0.1';
    return this.billingService.savePaymentMethod(orgId, dto, remoteIp);
  }

  @Delete('payment-method')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove payment method' })
  async removePaymentMethod(@CurrentUser() user: any) {
    const orgId = this.requireOrg(user);
    await this.billingService.removePaymentMethod(orgId);
  }

  @Get('invoices')
  @ApiOperation({ summary: 'List billing invoices for the organization' })
  async getInvoices(@CurrentUser() user: any) {
    const orgId = this.requireOrg(user);
    return this.billingService.getInvoices(orgId);
  }
}
