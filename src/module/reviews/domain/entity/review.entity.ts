import { randomUUID } from 'crypto';
import { CreateReviewProps, ReviewState } from '../types/review.type';
import { Rating } from '../value-objects/rating.vo';
import { ReviewText } from '../value-objects/review-text.vo';

export class Review {
  private constructor(
    private readonly props: Readonly<ReviewState>,
    readonly isNew: boolean,
  ) {}

  // getter

  public get id(): string {
    return this.props.id;
  }

  public get review(): string {
    return this.props.review.getValue();
  }

  public get rating(): number {
    return this.props.rating.getValue();
  }

  public get userId(): string {
    return this.props.userId;
  }

  public get courseId(): string {
    return this.props.courseId;
  }

  public get updatedAt(): Date {
    return new Date(this.props.updatedAt);
  }

  public get createdAt(): Date {
    return new Date(this.props.createdAt);
  }

  // setter

  public changeReview(review: string): Review {
    const reviewText = ReviewText.create(review);

    return this._copy({ review: reviewText, updatedAt: Date.now() });
  }

  public changeRating(rating: number): Review {
    const rateingValidation = Rating.create(rating);

    return this._copy({
      rating: rateingValidation,
      updatedAt: Date.now(),
    });
  }

  public static create(props: CreateReviewProps): Review {
    return new Review(
      {
        id: randomUUID(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        ...props,
      },
      true,
    );
  }

  public static rehydrate(props: ReviewState): Review {
    return new Review({ ...props }, false);
  }

  public toPersistence(): ReviewState {
    return {
      id: this.props.id,
      review: this.props.review,
      rating: this.props.rating,
      courseId: this.props.courseId,
      userId: this.props.userId,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }

  // helper
  private _copy(props: Partial<ReviewState>): Review {
    return new Review({ ...this.props, ...props }, this.isNew);
  }
}
