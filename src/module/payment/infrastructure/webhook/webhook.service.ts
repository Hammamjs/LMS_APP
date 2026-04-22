import { Inject, Injectable } from '@nestjs/common';
import { type IPaymentRepository } from '../../domain/repository/payment.interface';
import { IPAYMENT_REPOSITORY } from '../../domain/constants/injection.token';
import { EventBus } from '@nestjs/cqrs';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import {
  CoursePurchasedEvent,
  ICOURSE_REPOSITORY,
  type ICourseRepository,
} from '@/module/courses';

@Injectable()
export class WebhookService {
  constructor(
    @Inject(IPAYMENT_REPOSITORY)
    private readonly paymentRepo: IPaymentRepository,
    private readonly eventBus: EventBus,
    private readonly config: ConfigService,
    @Inject(ICOURSE_REPOSITORY) private readonly courseRepo: ICourseRepository,
  ) {}

  async handleStripeEvent(payload: any, signature: string) {
    const stripe = new Stripe(
      this.config.getOrThrow<string>('STRIPE_SECRET_KEY'),
      { apiVersion: '2026-03-25.dahlia' },
    );

    const webhookSecret = this.config.getOrThrow<string>(
      'STRIPE_SECRET_WEBHOOK',
    );

    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const internalId = paymentIntent.metadata.paymentId;

      const paymentResult = await this.paymentRepo.findByPaymentId(internalId);

      if (!paymentResult.ok) return paymentResult;

      const payment = paymentResult.value;

      const paymentSucceeded = payment.markPaymentAsSucceeded(internalId);

      await this.paymentRepo.save(paymentSucceeded);

      const courseResult = await this.courseRepo.findById(payment.getCourseId);

      if (!courseResult.ok) return courseResult;

      const course = courseResult.value;

      this.eventBus.publish(
        new CoursePurchasedEvent(
          payment.getUserId,
          course.getId(),
          course.getTitle(),
        ),
      );
    }
  }
}
