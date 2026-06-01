import { Review as PrismaReview, User as PrismaUser } from '@prisma/client';
import { Review } from '../../domain/entity/review.entity';
import { Rating } from '../../domain/value-objects/rating.vo';
import { ReviewText } from '../../domain/value-objects/review-text.vo';
import { UserRole } from '@/module/users';

export class ReviewMapper {
  private constructor() {}

  static toDomain(raw: PrismaReview) {
    return Review.rehydrate({
      ...raw,
      rating: Rating.create(raw.rating),
      review: ReviewText.create(raw.review),
    });
  }

  static toDomainWithUser(raw: PrismaReview & { user: PrismaUser }) {
    const domainReview = this.toDomain(raw);

    return Object.assign(domainReview, {
      user: {
        id: raw.user.id,
        username: raw.user.username,
        email: raw.user.email,
        bio: raw.user.bio,
        role: raw.user.role as UserRole,
      },
    });
  }
}
