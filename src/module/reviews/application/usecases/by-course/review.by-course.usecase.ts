import { IUseCase, ResponseBuilder, Result } from '@/core';
import { TReviewPaginationResponse } from '../../mapper/review.mapper.response';
import { Inject, Injectable } from '@nestjs/common';
import { IREVIEW_REPOSITORY } from '@/module/reviews/domain/constants/review.injection.token';
import { type IReviewRepository } from '@/module/reviews/domain/repository/review.interface.repository';
import { ReviewByCourseParams } from './review.by-course.params';

@Injectable()
export class FindReviewsByCourseUseCase implements IUseCase<
  ReviewByCourseParams,
  Promise<Result<TReviewPaginationResponse>>
> {
  constructor(
    @Inject(IREVIEW_REPOSITORY) private readonly reviewRepo: IReviewRepository,
  ) {}

  async execute(
    params: ReviewByCourseParams,
  ): Promise<Result<TReviewPaginationResponse>> {
    const { courseId, limit, page } = params;

    const courseResult = await this.reviewRepo.findByCourseId({
      courseId,
      limit,
      page,
    });

    if (!courseResult.ok) return Result.fail(courseResult.error);

    const { data, meta } = courseResult.value;

    const toResponse = ResponseBuilder.paginateMapped(data, meta, (item) => {
      return {
        id: item.id,
        rating: item.rating,
        content: item.content,
        userId: item.userId,
        courseId: item.courseId,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        user: item.user,
      };
    });

    return Result.ok(toResponse);
  }
}
