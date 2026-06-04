import { UserRole } from '@/module/users';
import { Review } from '../../domain/entity/review.entity';
import { ApiPaginateResponse } from '@/core';

type TReviewResponseInput = {
  review: Review;
  user?: {
    id: string;
    username: string;
    email: string;
    bio: string | null;
    role: UserRole;
  };
};

export class ReviewMapper {
  private constructor() {}
  static toResponse(input: TReviewResponseInput) {
    const { review, user } = input;
    return {
      id: review.id,
      content: review.content,
      rating: review.rating,
      userId: review.userId,
      courseId: review.courseId,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,

      user: user
        ? {
            id: user.id,
            username: user.username,
            bio: user.bio,
            email: user.email,
            role: user.role,
          }
        : null,
    };
  }
}

export type TReviewResponse = ReturnType<typeof ReviewMapper.toResponse>;

export type TReviewPaginationResponse = ApiPaginateResponse<TReviewResponse>;
