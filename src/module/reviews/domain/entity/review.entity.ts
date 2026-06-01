import { randomUUID } from 'crypto';
import { CreateReviewProps, ReviewState } from '../types/review.type';
import { Rating } from '../value-objects/rating.vo';
import { ReviewText } from '../value-objects/review-text.vo';

export interface IDomainEvent {
  dateTimeOccurred: Date;
  courseId: string;
  action: 'CREATED' | 'UPDATED' | 'DELETED';
}

export class Review {
  private readonly _domainEvent: IDomainEvent[] = [];
  private constructor(
    private readonly props: Readonly<ReviewState>,
    readonly isNew: boolean,
    public readonly events: IDomainEvent[] = [],
  ) {
    this._domainEvent = [];
  }

  // domain event
  public get domainEvents(): IDomainEvent[] {
    return [...this._domainEvent];
  }

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

    return this._copy(
      { review: reviewText, updatedAt: Date.now() },
      {
        courseId: this.props.courseId,
        action: 'UPDATED',
        dateTimeOccurred: new Date(),
      },
    );
  }

  public markAsDeleted(): Review {
    return this._copy(
      { isDeleted: true },
      {
        courseId: this.props.courseId,
        action: 'UPDATED',
        dateTimeOccurred: new Date(),
      },
    );
  }

  public changeRating(rating: number): Review {
    const rateingValidation = Rating.create(rating);

    return this._copy(
      {
        rating: rateingValidation,
        updatedAt: Date.now(),
      },
      // aggeragation
      {
        courseId: this.props.courseId,
        action: 'UPDATED',
        dateTimeOccurred: new Date(),
      },
    );
  }

  public static create(props: CreateReviewProps): Review {
    const event: IDomainEvent = {
      action: 'CREATED',
      courseId: props.courseId,
      dateTimeOccurred: new Date(),
    };

    const review = new Review(
      {
        id: randomUUID(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isDeleted: false,
        ...props,
      },
      true,
      [event],
    );

    return review;
  }

  public static rehydrate(props: ReviewState): Review {
    return new Review({ ...props }, false, []);
  }

  public toPersistence() {
    return {
      id: this.props.id,
      review: this.props.review.getValue(),
      rating: this.props.rating.getValue(),
      courseId: this.props.courseId,
      userId: this.props.userId,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      isDeleted: this.props.isDeleted,
    };
  }

  // helper
  private _copy(props: Partial<ReviewState>, newEvent?: IDomainEvent): Review {
    const updateEvents = newEvent
      ? [...this._domainEvent, newEvent]
      : this._domainEvent;

    return new Review({ ...this.props, ...props }, this.isNew, updateEvents);
  }
}
