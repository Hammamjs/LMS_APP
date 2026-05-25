import { forwardRef, Module, Provider } from '@nestjs/common';
import { EnrollmentController } from './presentation/enrollment.controller';
import { JwtModule } from '@nestjs/jwt';
import { FindEnrollmentByCourseAndUserUseCase } from './application/usecases/find-enrollment-by-course_user/find-enrollment-by-course_user.usecase';
import { EnrollmentPrimsaRepository } from './infrastructure/enrollement.prisma.repository';
import { IENROLLMENT_REPOSITORY } from './domain/constants/token.injection';
import { EnrollmentFacade } from './application/enrollment.facade';
import { FindEnrollmentByUserIdUseCase } from './application/usecases/find-enrollment-by-user-id/find-enrollment-by-user.usecase';
import { CourseEnrollmentHandler } from './application/handler/course-enrollment.handler';
import { CourseModule } from '../courses/course.module';

const usecase: Provider[] = [
  FindEnrollmentByCourseAndUserUseCase,
  FindEnrollmentByUserIdUseCase,
  EnrollmentFacade,
];

const infrastructure: Provider[] = [
  EnrollmentPrimsaRepository,
  { provide: IENROLLMENT_REPOSITORY, useClass: EnrollmentPrimsaRepository },
];

const handler: Provider[] = [CourseEnrollmentHandler];

@Module({
  exports: [IENROLLMENT_REPOSITORY, CourseEnrollmentHandler],
  providers: [...usecase, ...infrastructure, ...handler],
  controllers: [EnrollmentController],
  imports: [JwtModule, forwardRef(() => CourseModule)],
})
export class EnrollmentModule {}
