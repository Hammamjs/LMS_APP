import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  type RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PaymentFacade } from '../application/payment.facade';
import { PaymentDto } from './dto/payment.dto';
import { JwtPayload } from '@/module/auth';
import { RoleGuard, VerifyJwt } from '@/core';
import { UserRole } from '@/module/users';
import { Roles } from '@/core/common/infrastructure/decorators/roles.decorator';
import { WebhookService } from '../infrastructure/webhook/webhook.service';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentFacade: PaymentFacade,
    private readonly webhookService: WebhookService,
  ) {}

  @UseGuards(VerifyJwt, RoleGuard)
  @Roles(UserRole.Instructor, UserRole.Student)
  @Post()
  async pay(@Req() request: Request, @Body() dto: PaymentDto) {
    const { id: userId, email } = request['user'] as JwtPayload;
    return await this.paymentFacade.pay.execute({ ...dto, email, userId });
  }

  @UseGuards(VerifyJwt, RoleGuard)
  @Roles(UserRole.Student)
  @Get('user/payments-history')
  async userPaymentHistory(@Req() request: Request) {
    const { id } = request['user'] as JwtPayload;
    return await this.paymentFacade.UserPaymentHistory.execute(id);
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
      console.error('WEBHOOK_ERROR:', err); // THIS WILL SHOW YOU THE TRUTH
      throw err; // Re-throw to send 500 back to Stripe
    }
  }
}
