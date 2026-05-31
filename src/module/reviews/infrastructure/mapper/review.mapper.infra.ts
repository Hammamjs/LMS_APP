import { Review as prismaReview, User as PrismaUser } from '@prisma/client';
import { Review } from '../../domain/entity/review.entity';
import { Rating } from '../../domain/value-objects/rating.vo';
import { ReviewText } from '../../domain/value-objects/review-text.vo';

type ReviewWithUser = prismaReview & { user: PrismaUser };

export class ReviewMapper {
  private constructor() {}

  static toDomain(raw: prismaReview) {
    return Review.rehydrate({
      ...raw,
      rating: Rating.create(raw.rating),
      review: ReviewText.create(raw.review),
    });
  }

  static toDomainWithUser(raw: ReviewWithUser) {
    const domainReview = Review.rehydrate({
      ...raw,
      rating: Rating.create(raw.rating),
      review: ReviewText.create(raw.review),
    });

    return Object.assign(domainReview, {
      user: raw.user,
    });
  }
}
