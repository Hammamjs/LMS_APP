import {
  Result,
  PaginationResult,
  PrismaService,
  ErrorMapper,
  paginate,
  Errors,
} from '@/core';
import { Review } from '../domain/entity/review.entity';
import {
  IReviewRepository,
  ReviewWithUser,
} from '../domain/repository/review.interface.repository';
import {
  Prisma,
  Review as PrismaReview,
  User as PrismaUser,
} from '@prisma/client';
import { ReviewMapper } from './mapper/review.mapper.infra';
import { PaginationReviewParams } from '../domain/types/review.type';

export class ReviewPrismaRepository implements IReviewRepository {
  private readonly _entityName = 'Review';
  constructor(private readonly prisma: PrismaService) {}
  async save(review: Review): Promise<Result<Review>> {
    let data: PrismaReview;
    try {
      if (review.isNew) {
        data = await this.prisma.review.create({
          data: review.toPersistence(),
        });
      } else {
        data = await this.prisma.review.update({
          where: { id: review.id },
          data: review.toPersistence(),
        });
      }

      const toDomain = ReviewMapper.toDomain(data);

      return Result.ok(toDomain);
    } catch (err) {
      return ErrorMapper.toResult(err, this._entityName);
    }
  }

  async findByCourseId(
    params: PaginationReviewParams,
  ): Promise<Result<PaginationResult<ReviewWithUser>>> {
    const { courseId, limit, page } = params;

    const where: Prisma.ReviewWhereInput = {
      ...(courseId && { courseId }),
      isDeleted: false,
    };

    try {
      const paginationResult = await paginate<
        ReviewWithUser,
        PrismaReview & { user: PrismaUser }
      >(
        { page, limit },
        (args) =>
          this.prisma.review.findMany({
            ...args,
            where,
            include: { user: true },
          }),
        (args) => this.prisma.review.count({ ...args, where }),
        (row) => ReviewMapper.toDomainWithUser(row),
      );

      return paginationResult;
    } catch (err) {
      return ErrorMapper.toResult(err, this._entityName);
    }
  }

  async findByUserIdAndCourse(
    userId: string,
    courseId: string,
  ): Promise<Result<Review>> {
    try {
      const result = await this.prisma.review.findFirst({
        where: { courseId, userId, isDeleted: false },
      });

      if (!result) return Result.fail(Errors.notFound('Review not found'));

      const toDomain = ReviewMapper.toDomain(result);

      return Result.ok(toDomain);
    } catch (err) {
      return ErrorMapper.toResult(err, this._entityName);
    }
  }

  async delete(courseId: string, userId: string): Promise<Result<void>> {
    try {
      const result = await this.prisma.review.delete({
        where: {
          courseId_userId: {
            courseId,
            userId,
          },
        },
      });

      if (!result) return Result.fail(Errors.validation('Failed to delete'));

      return Result.ok(undefined);
    } catch (err) {
      return ErrorMapper.toResult(err, this._entityName);
    }
  }
}
