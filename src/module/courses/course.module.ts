import { Module, Provider } from '@nestjs/common';
import { CourseFacade } from './application/course.facade';
import { CreateCourseUseCase } from './application/create-course/create-course.usecase';
import { DeleteCourseUseCase } from './application/delete-course/delete-course.usecase';
import { UpdateCourseUseCase } from './application/update-course/update-course.usecase';
import { FindCourseUseCase } from './application/find-course/find-course.usecase';
import { FindCoursesUseCase } from './application/find-courses/find-courses.usecase';
import { ICOURSE_REPOSITORY } from './domain/constants/injection.token';
import { CourseRepository } from './infrastructure/course.prisma.repository';
import { UserModule } from '../users/user.module';
import { CourseController } from './presentation/course.controller';
import { IUSER_REPOSITORY } from '../users';
import { PrismaUserRepository } from '../users/infrastructure/prisma.user.repository';
import { AuthModule } from '../auth/auth.module';

const usecases: Provider[] = [
  CourseFacade,
  CreateCourseUseCase,
  DeleteCourseUseCase,
  UpdateCourseUseCase,
  FindCourseUseCase,
  FindCoursesUseCase,
];

const infrastructure: Provider[] = [
  CourseRepository,
  { provide: ICOURSE_REPOSITORY, useExisting: CourseRepository },
  { provide: IUSER_REPOSITORY, useClass: PrismaUserRepository },
];

@Module({
  imports: [UserModule, AuthModule],
  exports: [],
  controllers: [CourseController],
  providers: [...usecases, ...infrastructure],
})
export class CourseModule {}
