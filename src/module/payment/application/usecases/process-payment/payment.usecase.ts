import {
  ErrorMapper,
  Errors,
  IUNIT_OF_WORK_REPOSITORY,
  IUseCase,
  Result,
  type IUow,
} from '@/core';
import { ICOURSE_REPOSITORY, type ICourseRepository } from '@/module/courses';
import {
  Enrollment,
  IENROLLMENT_REPOSITORY,
  type IEnrollmentRepository,
} from '@/module/enrollment';
import { PaymentFactory } from '@/module/payment/infrastructure/gateway/payment.factory';
import { IUSER_REPOSITORY, type IUserRepository } from '@/module/users';
import { Inject, Injectable } from '@nestjs/common';
import { PaymentParams } from './payment.params';
import { ICACHE_REPOSITORY } from '@/module/auth/domain/constants/injection.token';
import { type ICacheRepository } from '@/module/auth/domain/repository/cache.repsoitory.interface';
import { IPAYMENT_REPOSITORY } from '@/module/payment/domain/constants/injection.token';
import { type IPaymentRepository } from '@/module/payment/domain/repository/payment.interface';
import { Payment } from '@/module/payment/domain/entity/payment.entity';
import { PaymentMapper, TPaymentResponse } from '../../mapper/payment.mapper';
import { EventBus } from '@nestjs/cqrs';
import { CoursePurchasedEvent } from '@/module/courses';
import { randomUUID } from 'crypto';

@Injectable()
export class PaymentProcessUseCase implements IUseCase<
  PaymentParams,
  Promise<Result<TPaymentResponse>>
> {
  constructor(
    private readonly gateway: PaymentFactory,
    @Inject(IUNIT_OF_WORK_REPOSITORY) private readonly uow: IUow,
    @Inject(IUSER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(IENROLLMENT_REPOSITORY)
    private readonly enrollmentRepo: IEnrollmentRepository,
    @Inject(ICOURSE_REPOSITORY) private readonly courseRepo: ICourseRepository,
    @Inject(ICACHE_REPOSITORY) private readonly cacheRepo: ICacheRepository,
    @Inject(IPAYMENT_REPOSITORY)
    private readonly paymentRepo: IPaymentRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(params: PaymentParams): Promise<Result<TPaymentResponse>> {
    // we need to check if user enrolled before anything
    const isUserEnrolled = await this.enrollmentRepo.findByCourseAndUser(
      params.userId,
      params.courseId,
    );

    if (isUserEnrolled.ok)
      return Result.fail(
        Errors.conflict('You are already enrolled in this course.'),
      );

    // create idempotency key
    // we need to check if the request has been duplicated
    // to prevent take duoble price from user
    const lockKey = `lock:payment:${params.userId}:${params.courseId}`;

    const lockAcquired = await this.cacheRepo.setNx(lockKey, 'processing', 30);

    if (!lockAcquired.ok)
      return Result.fail(Errors.conflict('Payment already in progress'));

    try {
      // extenal call
      const gateway = this.gateway.get(params.provider);

      const chargResult = await gateway.pay({
        amount: params.amount,
        currency: params.currency,
        email: params.email,
        source: params.source,
        paymentId: randomUUID(),
      });

      if (!chargResult.ok) return chargResult;

      return this.uow.runInTransaction(async () => {
        // re verify if user enrolled
        // if first test passed and race condition occur
        // this like second guard
        const isStillEnrolled = await this.enrollmentRepo.findByCourseAndUser(
          params.userId,
          params.courseId,
        );

        if (isStillEnrolled.ok)
          return Result.fail(Errors.conflict('User already enrolled'));

        const [userResult, courseResult] = await Promise.all([
          this.userRepo.findByEmail(params.email),
          this.courseRepo.findById(params.courseId),
        ]);

        if (!userResult.ok) return userResult;
        if (!courseResult.ok) return courseResult;

        const user = userResult.value;
        const course = courseResult.value;

        // we need to save user enrollment
        const createEnrollment = Enrollment.create({
          userId: user.getId(),
          courseId: course.getId(),
        });
        const savedResult = await this.enrollmentRepo.save(createEnrollment);

        if (!savedResult.ok) return savedResult;

        const { status, paymentId } = chargResult.value;

        // we need to save user payment processer
        const createPayment = Payment.create({
          amount: params.amount,
          provider: params.provider,
          userId: params.userId,
          paymentId: paymentId,
          status: status,
          courseId: params.courseId,
        });

        const paymentResult = await this.paymentRepo.save(createPayment);

        if (!paymentResult.ok)
          return Result.fail(
            Errors.internal('Payment process failed to saved'),
          );

        // we need to send notification to user
        this.eventBus.publish(
          new CoursePurchasedEvent(
            user.getId(),
            course.getId(),
            course.getTitle(),
          ),
        );

        // return response for client side

        return Result.ok(PaymentMapper.toResponse(paymentResult.value));
      });
    } catch (err) {
      return ErrorMapper.toResult(err, 'Payment');
    } finally {
      await this.cacheRepo.del(lockKey);
    }
  }
}
