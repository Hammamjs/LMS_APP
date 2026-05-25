import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  type RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PaymentFacade } from '../application/payment.facade';
import { PaymentDto } from './dto/payment.dto';
import { JwtPayload } from '@/module/auth';
import { VerifyJwt } from '@/core';
import { WebhookService } from '../infrastructure/webhook/webhook.service';
import { PaymentQuery } from './dto/payment.query.dto';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentFacade: PaymentFacade,
    private readonly webhookService: WebhookService,
  ) {}

  @UseGuards(VerifyJwt)
  @Post()
  async pay(@Req() request: Request, @Body() dto: PaymentDto) {
    const { id: userId, email } = request['user'] as JwtPayload;
    return await this.paymentFacade.pay.execute({ ...dto, email, userId });
  }

  @UseGuards(VerifyJwt)
  @Get('user/payments-history')
  async userPaymentHistory(
    @Query() dto: PaymentQuery,
    @Req() request: Request,
  ) {
    const { id } = request['user'] as JwtPayload;
    return await this.paymentFacade.UserPaymentHistory.execute({
      userId: id,
      ...dto,
    });
  }

  @Post('webhook')
  async handleWebhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    try {
      await this.webhookService.handleStripeEvent(request.rawBody, signature);
      return { recived: true };
    } catch (err) {
      console.error('WEBHOOK_ERROR:', err);
      throw err;
    }
  }
}
