import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { Result } from '@/core';

@Injectable()
export class WebhookService {
  constructor(
    @Inject(IPAYMENT_REPOSITORY)
    private readonly paymentRepo: IPaymentRepository,
    private readonly eventBus: EventBus,
    private readonly config: ConfigService,
    @Inject(ICOURSE_REPOSITORY) private readonly courseRepo: ICourseRepository,
  ) {}

  async handleStripeEvent(
    payload: Buffer | string,
    signature: string,
  ): Promise<void> {
    const stripe = new Stripe(
      this.config.getOrThrow<string>('STRIPE_SECRET_KEY'),
      { apiVersion: '2026-05-27.dahlia' },
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

      if (!internalId) {
        throw new BadRequestException(
          'Missing paymentId metadata within Stripe Payload',
        );
      }

      const paymentResult = await this.paymentRepo.findByPaymentId(internalId);
      if (Result.isFail(paymentResult))
        throw new NotFoundException(
          `Payment record tracking lookup failed: ${paymentResult.error?.message}`,
        );

      const payment = paymentResult.value;

      // Only process if it hasn't been updated yet (Idempotency check)
      if (payment.getStatus !== 'SUCCESS') {
        // 1. Flip domain status state inside entity logic
        const paymentSucceeded = payment.markPaymentAsSucceeded(internalId);
        await this.paymentRepo.save(paymentSucceeded);

        const courseResult = await this.courseRepo.findById(
          payment.getCourseId,
        );
        if (Result.isFail(courseResult))
          throw new NotFoundException(
            `Course target verification lookup failed: ${courseResult.error?.message}`,
          );
        const { course: courseEntity } = courseResult.value;

        // 2. Dispatch the event. Your Event Handler will capture this
        // and cleanly generate the database record inside the Enrollment table!
        this.eventBus.publish(
          new CoursePurchasedEvent(
            payment.getUserId,
            courseEntity.id,
            courseEntity.title,
          ),
        );
      }
    }
  }
}
