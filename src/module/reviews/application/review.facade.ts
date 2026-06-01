import { FindReviewsByCourseUseCase } from './usecases/by-course/review.by-course.usecase';
import { CreateReviewUseCase } from './usecases/create/create.review.usecase';
import { DeleteReviewUseCase } from './usecases/delete/delete.review.usecase';
import { UpdateReviewUseCase } from './usecases/update/update.review.usecase';

export class ReviewFacade {
  constructor(
    public readonly create: CreateReviewUseCase,
    public readonly update: UpdateReviewUseCase,
    public readonly findByCourse: FindReviewsByCourseUseCase,
    public readonly deleteReview: DeleteReviewUseCase,
  ) {}
}
