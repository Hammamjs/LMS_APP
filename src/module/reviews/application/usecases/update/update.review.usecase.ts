import { IUseCase, Result } from '@/core';
import { UpdateReviewParams } from './update.review.params';
import {
  ReviewMapper,
  TReviewResponse,
} from '../../mapper/review.mapper.response';
import { Inject, Injectable } from '@nestjs/common';
import { IREVIEW_REPOSITORY } from '@/module/reviews/domain/constants/review.injection.token';
import { type IReviewRepository } from '@/module/reviews/domain/repository/review.interface.repository';
import { EventBus } from '@nestjs/cqrs';

@Injectable()
export class UpdateReviewUseCase implements IUseCase<
  UpdateReviewParams,
  Promise<Result<TReviewResponse>>
> {
  constructor(
    @Inject(IREVIEW_REPOSITORY) private readonly reviewRepo: IReviewRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(params: UpdateReviewParams): Promise<Result<TReviewResponse>> {
    const { courseId, userId, rating, review } = params;

    const reviewResult = await this.reviewRepo.findByUserIdAndCourse(
      userId,
      courseId,
    );

    if (!reviewResult.ok) return Result.fail(reviewResult.error);

    const reviewEntity = reviewResult.value;

    const updatedReview = reviewEntity
      .changeRating(rating ?? reviewEntity.rating)
      .changeReview(review ?? reviewEntity.review);

    const savedReview = await this.reviewRepo.save(updatedReview);

    if (!savedReview.ok) return Result.fail(savedReview.error);

    if (updatedReview.domainEvents.length > 0) {
      this.eventBus.publishAll(updatedReview.domainEvents);
    }

    const toResponse = ReviewMapper.toResponse({ review: savedReview.value });

    return Result.ok(toResponse);
  }
}
