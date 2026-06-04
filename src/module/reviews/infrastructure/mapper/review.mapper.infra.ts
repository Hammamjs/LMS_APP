import { Review as PrismaReview, User as PrismaUser } from '@prisma/client';
import { Review } from '../../domain/entity/review.entity';
import { Rating } from '../../domain/value-objects/rating.vo';
import { ContentText } from '../../domain/value-objects/review-text.vo';
import { UserRole } from '@/module/users';

export class ReviewMapper {
  private constructor() {}

  static toDomain(raw: PrismaReview) {
    return Review.rehydrate({
      ...raw,
      deletedAt: Math.floor(new Date(raw.createdAt).getTime() / 1000),
      rating: Rating.create(raw.rating),
      content: ContentText.create(raw.content),
    });
  }

  static toDomainWithUser(raw: PrismaReview & { user: PrismaUser }) {
    const domainReview = this.toDomain(raw);

    if (!raw.user) {
      throw new Error(
        `Review ${raw.id} has no associated user — data integrity issue`,
      );
    }

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
