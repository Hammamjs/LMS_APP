import { forwardRef, Module, Provider } from '@nestjs/common';
import { ReviewController } from './presentation/review.controller';
import { CourseModule } from '../courses/course.module';
import { ReviewPrismaRepository } from './infrastructure/review.prisma.repository';
import { IREVIEW_REPOSITORY } from './domain/constants/review.injection.token';
import { CreateReviewUseCase } from './application/usecases/create/create.review.usecase';
import { UpdateReviewUseCase } from './application/usecases/update/update.review.usecase';
import { DeleteReviewUseCase } from './application/usecases/delete/delete.review.usecase';
import { FindReviewsByCourseUseCase } from './application/usecases/by-course/review.by-course.usecase';
import { ReviewFacade } from './application/review.facade';
import { ReviewChangeHandler } from './application/handler/review.handler';
import { CqrsModule } from '@nestjs/cqrs';
import { EnrollmentModule } from '../enrollment/enrollment.module';
import { JwtModule } from '@nestjs/jwt';

const infrastructure: Provider[] = [
  ReviewPrismaRepository,
  {
    provide: IREVIEW_REPOSITORY,
    useClass: ReviewPrismaRepository,
  },
];

const usecases: Provider[] = [
  CreateReviewUseCase,
  UpdateReviewUseCase,
  DeleteReviewUseCase,
  FindReviewsByCourseUseCase,
  // facade
  ReviewFacade,
];

const handler: Provider[] = [ReviewChangeHandler];

@Module({
  imports: [
    forwardRef(() => CourseModule),
    CqrsModule,
    EnrollmentModule,
    JwtModule,
  ],
  providers: [...usecases, ...infrastructure, ...handler],
  controllers: [ReviewController],
})
export class ReviewModule {}
