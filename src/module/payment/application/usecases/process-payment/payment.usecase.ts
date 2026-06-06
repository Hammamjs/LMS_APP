import {
  ErrorMapper,
  Errors,
  ILOGGER_SERVICE,
  type ILoggerService,
  IUNIT_OF_WORK_REPOSITORY,
  IUseCase,
  Result,
  type IUow,
} from '@/core';
import {
  Course,
  ICOURSE_REPOSITORY,
  type ICourseRepository,
} from '@/module/courses';
import {
  IENROLLMENT_REPOSITORY,
  type IEnrollmentRepository,
} from '@/module/enrollment';
import { PaymentFactory } from '@/module/payment/infrastructure/gateway/payment.factory';
import { IUSER_REPOSITORY, User, type IUserRepository } from '@/module/users';
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

type PaymentResponse = {
  payment: TPaymentResponse;
  user: User;
  course: Course;
};

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
    @Inject(ILOGGER_SERVICE) private readonly logger: ILoggerService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(params: PaymentParams): Promise<Result<TPaymentResponse>> {
    // 1. First-pass Guard check
    const isUserEnrolled = await this.enrollmentRepo.findByCourseAndUser(
      params.userId,
      params.courseId,
    );
    if (isUserEnrolled.ok && isUserEnrolled.value) {
      return Result.fail<TPaymentResponse>(Errors.conflict('Already enrolled'));
    }

    // 2. Establish Redis Distributed Idempotency Lock
    const lockKey = `lock:payment:${params.userId}:${params.courseId}`;
    const lockAcquired = await this.cacheRepo.setNx(lockKey, 'processing', 30);
    if (Result.isFail(lockAcquired)) {
      return Result.fail<TPaymentResponse>(
        Errors.conflict('Payment already in progress'),
      );
    }

    const [userResult, courseResult] = await Promise.all([
      this.userRepo.findByEmail(params.email),
      this.courseRepo.findById(params.courseId),
    ]);

    if (Result.isFail(userResult))
      return Result.fail<TPaymentResponse>(userResult.error);
    if (Result.isFail(courseResult))
      return Result.fail<TPaymentResponse>(courseResult.error);

    const user = userResult.value;
    const { course: courseEntity } = courseResult.value;

    const internalPaymentTrackingId = randomUUID();

    try {
      const gateway = this.gateway.get(params.provider);

      // 3. Fire the external Network call safely
      const chargResult = await gateway.pay({
        amount: params.amount,
        currency: params.currency,
        email: params.email,
        source: params.source,
        paymentId: internalPaymentTrackingId,
      });

      if (Result.isFail(chargResult))
        return Result.fail<TPaymentResponse>(chargResult.error);

      // 4. Run database modifications atomically inside the Unit of Work transaction
      const result = await this.uow.runInTransaction<Result<PaymentResponse>>(
        async () => {
          // Double Check Guard inside the database isolation level
          const isStillEnrolled = await this.enrollmentRepo.findByCourseAndUser(
            params.userId,
            params.courseId,
          );

          // If they managed to enroll while the gateway network call was in flight,
          // we must explicitly throw to trigger a database rollback strategy
          if (isStillEnrolled.ok && isStillEnrolled.value) {
            throw new Error(
              'CRITICAL_RACE: User enrolled during payment transaction processing.',
            );
          }

          const { status } = chargResult.value;

          const createPayment = Payment.create({
            amount: params.amount,
            provider: params.provider,
            userId: params.userId,
            paymentId: internalPaymentTrackingId,
            status: status,
            courseId: params.courseId,
          });

          const paymentResult = await this.paymentRepo.save(createPayment);
          if (Result.isFail(paymentResult)) {
            return Result.fail<PaymentResponse>(
              Errors.internal('Payment record failed to commit securely'),
            );
          }

          return Result.ok({
            payment: PaymentMapper.toResponse(paymentResult.value),
            user,
            course: courseEntity,
          });
        },
      );

      if (Result.isFail(result))
        return Result.fail<TPaymentResponse>(result.error);

      // 5. Notify surrounding context aggregates via CQRS Event Bus
      this.eventBus.publish(
        new CoursePurchasedEvent(
          result.value.user.id,
          result.value.course.id,
          result.value.course.title,
        ),
      );

      return Result.ok(result.value.payment);
    } catch (err) {
      this.logger.error(
        `Payment processing failed`,
        err instanceof Error ? err.stack : String(err),
      );
      return ErrorMapper.toResult(err, 'Payment');
    } finally {
      await this.cacheRepo.del(lockKey);
    }
  }
}
