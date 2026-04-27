import { Module, Provider } from '@nestjs/common';
import { PaymentController } from './presentation/payment.controller';
import { JwtModule } from '@nestjs/jwt';
import { PaymentProcessUseCase } from './application/usecases/process-payment/payment.usecase';
import { PaymentFacade } from './application/payment.facade';
import { PrismaUnitOfWork } from '@/core/common/infrastructure/http/transaction/prisma.unit-of-work';
import { PrismaUserRepository } from '../users/infrastructure/prisma.user.repository';
import { EnrollmentPrimsaRepository } from '../enrollment/infrastructure/enrollement.prisma.repository';
import { RedisCacheRepository } from '../auth/infrastructure/repository/redis-cache.repository';
import { PaymentPrisma } from './infrastructure/persistence/payment.prisma.repository';
import { CourseRepository } from '../courses/infrastructure/course.prisma.repository';
import { IUNIT_OF_WORK_REPOSITORY } from '@/core';
import { IUSER_REPOSITORY } from '../users';
import { IENROLLMENT_REPOSITORY } from '../enrollment';
import { ICOURSE_REPOSITORY } from '../courses';
import { ICACHE_REPOSITORY } from '../auth';
import { IPAYMENT_REPOSITORY } from './domain/constants/injection.token';
import { PaymentFactory } from './infrastructure/gateway/payment.factory';
import { CqrsModule } from '@nestjs/cqrs';
import { BankGatewayService } from './infrastructure/gateway/bank.gateway';
import { StripeGatewayService } from './infrastructure/gateway/stripe.gateway';
import { WebhookService } from './infrastructure/webhook/webhook.service';
import { UserPaymentHistoryUseCase } from './application/usecases/user-payments/user-payment-history.usecase';

const usecases: Provider[] = [
  PaymentProcessUseCase,
  UserPaymentHistoryUseCase,
  PaymentFacade,
  PaymentFactory,
];

const infrastructure: Provider[] = [
  PrismaUnitOfWork,
  PrismaUserRepository,
  EnrollmentPrimsaRepository,
  CourseRepository,
  RedisCacheRepository,
  PaymentPrisma,
  BankGatewayService,
  StripeGatewayService,
  WebhookService,
  {
    provide: IUNIT_OF_WORK_REPOSITORY,
    useClass: PrismaUnitOfWork,
  },
  {
    provide: IUSER_REPOSITORY,
    useClass: PrismaUserRepository,
  },
  {
    provide: IENROLLMENT_REPOSITORY,
    useClass: EnrollmentPrimsaRepository,
  },
  {
    provide: ICOURSE_REPOSITORY,
    useClass: CourseRepository,
  },
  {
    provide: ICACHE_REPOSITORY,
    useClass: RedisCacheRepository,
  },
  {
    provide: IPAYMENT_REPOSITORY,
    useClass: PaymentPrisma,
  },
];

@Module({
  exports: [],
  providers: [...usecases, ...infrastructure],
  controllers: [PaymentController],
  imports: [JwtModule, CqrsModule],
})
export class PaymentModule {}
