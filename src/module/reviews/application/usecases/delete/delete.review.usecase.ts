import { IUseCase, Result } from '@/core';
import { IREVIEW_REPOSITORY } from '@/module/reviews/domain/constants/review.injection.token';
import { type IReviewRepository } from '@/module/reviews/domain/repository/review.interface.repository';
import { Inject, Injectable } from '@nestjs/common';
import { DeleteReviewParams } from './delete.review.params';
import { EventBus } from '@nestjs/cqrs';

@Injectable()
export class DeleteReviewUseCase implements IUseCase<
  DeleteReviewParams,
  Promise<Result<void>>
> {
  constructor(
    @Inject(IREVIEW_REPOSITORY) private readonly reviewRepo: IReviewRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(params: DeleteReviewParams): Promise<Result<void>> {
    const { userId, courseId } = params;
    const reviewResult = await this.reviewRepo.findByUserIdAndCourse(
      userId,
      courseId,
    );

    if (!reviewResult.ok) {
      return Result.fail(reviewResult.error);
    }

    const review = reviewResult.value;

    const deletedReview = review.markAsDeleted();

    const savedReview = await this.reviewRepo.delete(
      review.courseId,
      review.userId,
    );

    if (!savedReview.ok) return Result.fail(savedReview.error);

    if (deletedReview.domainEvents.length > 0) {
      this.eventBus.publishAll(deletedReview.domainEvents);
    }

    return Result.ok(undefined);
  }
}
