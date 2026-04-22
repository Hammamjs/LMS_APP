import { Errors, Result } from '@/core';
import {
  IPaymentGateway,
  PaymentCharageParams,
  PaymentResponse,
} from '../../domain/repository/payment.interface';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StripeGatewayService implements IPaymentGateway {
  private _stripe: Stripe.Stripe;

  constructor(private readonly config: ConfigService) {
    const stripeApiKey = this.config.getOrThrow<string>('STRIPE_SECRET_KEY');
    this._stripe = new Stripe(stripeApiKey, {
      apiVersion: '2026-03-25.dahlia',
    });
  }

  getName(): string {
    return 'STRIPE';
  }

  async pay(params: PaymentCharageParams): Promise<Result<PaymentResponse>> {
    try {
      const paymentIntents = await this._stripe.paymentIntents.create({
        amount: Math.round(params.amount * 100),
        currency: params.currency || 'usd',
        payment_method: params.source,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
        metadata: {
          internalPaymentId: params.paymentId,
        },
      });
      return Result.ok({
        paymentId: paymentIntents.id,
        status: paymentIntents.status === 'succeeded' ? 'SUCCESS' : 'FAILED',
        rawResponse: paymentIntents,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unknown stripe error';
      return Result.fail(Errors.internal(message));
    }
  }
}
