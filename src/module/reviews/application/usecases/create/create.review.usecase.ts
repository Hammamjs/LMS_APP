import { Errors, IUseCase, Result } from '@/core';
import { CreateReviewParams } from './create.review.params';
import {
  ReviewMapper,
  TReviewResponse,
} from '../../mapper/review.mapper.response';
import { IREVIEW_REPOSITORY } from '@/module/reviews/domain/constants/review.injection.token';
import { type IReviewRepository } from '@/module/reviews/domain/repository/review.interface.repository';
import { Inject, Injectable } from '@nestjs/common';
import { ICOURSE_REPOSITORY, type ICourseRepository } from '@/module/courses';
import {
  IENROLLMENT_REPOSITORY,
  type IEnrollmentRepository,
} from '@/module/enrollment';
import { Review } from '@/module/reviews/domain/entity/review.entity';
import { ContentText } from '@/module/reviews/domain/value-objects/review-text.vo';
import { Rating } from '@/module/reviews/domain/value-objects/rating.vo';
import { EventBus } from '@nestjs/cqrs';

@Injectable()
export class CreateReviewUseCase implements IUseCase<
  CreateReviewParams,
  Promise<Result<TReviewResponse>>
> {
  constructor(
    @Inject(IREVIEW_REPOSITORY) private readonly reviewRepo: IReviewRepository,
    @Inject(ICOURSE_REPOSITORY) private readonly courseRepo: ICourseRepository,
    @Inject(IENROLLMENT_REPOSITORY)
    private readonly enrollmentRepo: IEnrollmentRepository,
    private eventBus: EventBus,
  ) {}

  async execute(params: CreateReviewParams): Promise<Result<TReviewResponse>> {
    const { courseId, rating, content, userId } = params;

    // we need to check if user enrolled at this course
    const enrollmentResult = await this.enrollmentRepo.findByCourseAndUser(
      userId,
      courseId,
    );

    if (!enrollmentResult.ok)
      return Result.fail(
        Errors.forbidden('User not enrolled at this course yet.'),
      );

    // we need to check if course exists
    const courseResult = await this.courseRepo.findById(courseId);

    if (!courseResult.ok) return courseResult;

    // we need to check if current user has already review on this course firstly
    const reviewResult = await this.reviewRepo.findByUserIdAndCourse(
      userId,
      courseId,
    );

    if (reviewResult.ok)
      return Result.fail(
        Errors.conflict('User already has commented on this course'),
      );

    // otherwise we need to create review for this user

    const createReview = Review.create({
      userId,
      courseId,
      content: ContentText.create(content),
      rating: Rating.create(rating),
    });

    const savedReview = await this.reviewRepo.save(createReview);

    if (!savedReview.ok) return savedReview;

    // fire event if exists
    if (createReview.domainEvents.length > 0) {
      this.eventBus.publishAll(createReview.domainEvents);
    }

    const toResponse = ReviewMapper.toResponse({
      review: savedReview.value,
    });

    return Result.ok(toResponse);
  }
}
