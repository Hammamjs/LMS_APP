import { Module, Provider } from '@nestjs/common';
import { LessonController } from './presentation/lessons.controller';
import { CreateLessonUsecase } from './application/usecases/create-lesson/create-lesson.usecase';
import { LessonFacade } from './application/lessons.facade';
import { UserModule } from '../users/user.module';
import { CourseModule } from '../courses/course.module';
import { LessonPrismaRepository } from './infrastructure/lesson.prisma.repository';
import { ILESSON_REPOSITORY } from './domain/constants/token.injection';
import { JwtModule } from '@nestjs/jwt';
import { FindLessonUseCase } from './application/usecases/find-lesson/find-lesson.usecase';
import { FindLessonsUseCase } from './application/usecases/find-lessons/find-lessons.usecase';

const usecase: Provider[] = [
  CreateLessonUsecase,
  FindLessonUseCase,
  FindLessonsUseCase,
  LessonFacade,
];

const infrastructure: Provider[] = [
  LessonPrismaRepository,
  {
    provide: ILESSON_REPOSITORY,
    useClass: LessonPrismaRepository,
  },
];

@Module({
  providers: [...usecase, ...infrastructure],
  controllers: [LessonController],
  exports: [],
  imports: [UserModule, CourseModule, JwtModule],
})
export class LessonModule {}
