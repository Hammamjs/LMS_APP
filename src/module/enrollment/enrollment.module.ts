import { Module, Provider } from '@nestjs/common';
import { EnrollmentController } from './presentation/enrollment.controller';
import { JwtModule } from '@nestjs/jwt';
import { FindEnrollmentByCourseAndUserUseCase } from './application/usecases/find-enrollment-by-course_user/find-enrollment-by-course_user.usecase';
import { EnrollmentPrimsaRepository } from './infrastructure/enrollement.prisma.repository';
import { IENROLLMENT_REPOSITORY } from './domain/constants/token.injection';
import { EnrollmentFacade } from './application/enrollment.facade';
import { FindEnrollmentByUserIdUseCase } from './application/usecases/find-enrollment-by-user-id/find-enrollment-by-user.usecase';

const usecase: Provider[] = [
  FindEnrollmentByCourseAndUserUseCase,
  FindEnrollmentByUserIdUseCase,
  EnrollmentFacade,
];

const infrastructure: Provider[] = [
  EnrollmentPrimsaRepository,
  { provide: IENROLLMENT_REPOSITORY, useClass: EnrollmentPrimsaRepository },
];

@Module({
  exports: [],
  providers: [...usecase, ...infrastructure],
  controllers: [EnrollmentController],
  imports: [JwtModule],
})
export class EnrollmentModule {}
