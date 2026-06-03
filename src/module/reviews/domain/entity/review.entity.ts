import { randomUUID } from 'crypto';
import { CreateReviewProps, ReviewState } from '../types/review.type';
import { Rating } from '../value-objects/rating.vo';
import { ContentText } from '../value-objects/review-text.vo';

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
    this._domainEvent = events;
  }

  // domain event
  public get domainEvents(): IDomainEvent[] {
    return [...this._domainEvent];
  }

  // getter

  public get id(): string {
    return this.props.id;
  }

  public get content(): string {
    return this.props.content.getValue();
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
    return new Date(this.props.updatedAt * 1000);
  }

  public get createdAt(): Date {
    return new Date(this.props.createdAt * 1000);
  }

  public get deletedAt(): Date | null {
    return this.props.deletedAt ? new Date(this.props.deletedAt * 1000) : null;
  }

  // setter

  public changeReview(review: string): Review {
    const reviewText = ContentText.create(review);

    return this._copy(
      { content: reviewText, updatedAt: Math.floor(Date.now() / 1000) },
      {
        courseId: this.props.courseId,
        action: 'UPDATED',
        dateTimeOccurred: new Date(),
      },
    );
  }

  public markAsDeleted(): Review {
    return this._copy(
      { deletedAt: Math.floor(Date.now() / 1000) },
      {
        courseId: this.props.courseId,
        action: 'DELETED',
        dateTimeOccurred: new Date(),
      },
    );
  }

  public changeRating(rating: number): Review {
    const rateingValidation = Rating.create(rating);

    const nowInSeconds = Math.floor(Date.now() / 1000);

    return this._copy(
      {
        rating: rateingValidation,
        updatedAt: nowInSeconds,
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

    const nowInSeconds = Math.floor(Date.now() / 1000);

    const review = new Review(
      {
        id: randomUUID(),
        createdAt: nowInSeconds,
        updatedAt: nowInSeconds,
        deletedAt: null,
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
      content: this.props.content.getValue(),
      rating: this.props.rating.getValue(),
      courseId: this.props.courseId,
      userId: this.props.userId,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      deletedAt: this.props.deletedAt,
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
