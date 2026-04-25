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
import { DeleteLessonUseCase } from './application/usecases/delete-lesson/delete-lesson.usecase';
import { UpdateLessonUseCase } from './application/usecases/update-lesson/update-lesson.usecase';
import { EnrollmentPrimsaRepository } from '../enrollment/infrastructure/enrollement.prisma.repository';
import { IENROLLMENT_REPOSITORY } from '../enrollment';
import { CqrsModule } from '@nestjs/cqrs';
import { NotifyStudentsOnLessonCreatedHandler } from './application/handler/notifiy-student.hander';
import { NotificationModule } from '../notification/notification.module';

const usecase: Provider[] = [
  CreateLessonUsecase,
  FindLessonUseCase,
  FindLessonsUseCase,
  DeleteLessonUseCase,
  UpdateLessonUseCase,
  LessonFacade,
];

const eventHandler: Provider[] = [NotifyStudentsOnLessonCreatedHandler];

const infrastructure: Provider[] = [
  LessonPrismaRepository,
  EnrollmentPrimsaRepository,
  {
    provide: ILESSON_REPOSITORY,
    useClass: LessonPrismaRepository,
  },
  {
    provide: IENROLLMENT_REPOSITORY,
    useClass: EnrollmentPrimsaRepository,
  },
];

@Module({
  providers: [...usecase, ...infrastructure, ...eventHandler],
  controllers: [LessonController],
  exports: [],
  imports: [
    UserModule,
    CourseModule,
    JwtModule,
    CqrsModule,
    NotificationModule,
  ],
})
export class LessonModule {}
