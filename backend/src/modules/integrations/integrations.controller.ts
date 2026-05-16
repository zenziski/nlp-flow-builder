import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Integrations')
@ApiBearerAuth()
@Controller('integrations')
export class IntegrationsController {
  @Get('webhooks')
  @ApiOperation({ summary: 'List configured webhooks (stub)' })
  listWebhooks() {
    return { webhooks: [], message: 'Webhooks integration coming soon' };
  }

  @Public()
  @Post('webhook/:botId')
  @ApiOperation({ summary: 'Webhook endpoint for external integrations' })
  receiveWebhook(@Param('botId') botId: string, @Body() payload: any) {
    console.log(`Webhook received for bot ${botId}:`, payload);
    return { received: true, botId };
  }
}
