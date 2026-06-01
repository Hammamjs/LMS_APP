import { PaginationResult, Result } from '@/core';
import { Review } from '../entity/review.entity';
import { PaginationReviewParams } from '../types/review.type';
import { UserRole } from '@/module/users';

export type ReviewWithUser = Review & {
  user: {
    id: string;
    username: string;
    email: string;
    bio: string | null;
    role: UserRole;
  };
};

export interface IReviewRepository {
  save: (review: Review) => Promise<Result<Review>>;

  findByCourseId: (
    params: PaginationReviewParams,
  ) => Promise<Result<PaginationResult<ReviewWithUser>>>;

  findByUserIdAndCourse: (
    userId: string,
    courseId: string,
  ) => Promise<Result<Review>>;

  delete: (courseId: string, userId: string) => Promise<Result<void>>;
}
