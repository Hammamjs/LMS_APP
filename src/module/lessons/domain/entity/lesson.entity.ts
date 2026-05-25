import { randomUUID } from 'crypto';
import { ExcludedProps, LessonProps, LessonState } from '../lesson.type';

export class Lesson {
  private constructor(
    private props: LessonState,
    public readonly isNew: boolean,
  ) {}

  public static create(props: Omit<LessonProps, ExcludedProps>): Lesson {
    return new Lesson(
      {
        ...props,
        id: randomUUID(),
        rating: 0,
        isFree: props.isFree ?? false,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        duration: props.duration,
      },
      true,
    );
  }

  public static rehydrate(props: LessonProps): Lesson {
    return new Lesson(props, false);
  }

  public get id(): string {
    return this.props.id;
  }

  public get title(): string {
    return this.props.title;
  }

  public get description(): string {
    return this.props.description;
  }

  public get order(): number {
    return this.props.order;
  }

  public get url(): string {
    return this.props.url;
  }

  public get duration(): number {
    return this.props.duration;
  }

  public get isDeletedLesson(): boolean {
    return this.props.isDeleted;
  }

  public get isFree(): boolean {
    return this.props.isFree;
  }

  public get rating(): number {
    return this.props.rating;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public get courseId(): string {
    return this.props.courseId;
  }

  public withTitle(newTitle: string): Lesson {
    const title = this._required(newTitle, 'Title');
    return this._copy({ title });
  }

  public withDescription(newDescription: string): Lesson {
    const description = this._required(newDescription, 'Description');

    return this._copy({ description });
  }

  public withOrder(): Lesson {
    const order = this.props.order + 1;
    return this._copy({ order });
  }

  public setUrl(newUrl: string): Lesson {
    const url = this._required(newUrl, 'url');

    return this._copy({ url });
  }

  public withCourseId(id: string): Lesson {
    const courseId = this._required(id, 'Course id');
    return this._copy({ courseId });
  }

  public markLessonAsFree(): Lesson {
    return this._copy({ isFree: true });
  }

  public markLessonAsPaid(): Lesson {
    return this._copy({ isFree: false });
  }

  public markAsDeleted(): Lesson {
    return this._copy({ isDeleted: true });
  }

  public setDuration(time: number): Lesson {
    if (time <= 0) throw new Error('Duration');

    return this._copy({ duration: time });
  }

  public updateAverageRating(rating: number) {
    if (typeof rating !== 'number' || rating < 0 || rating > 5)
      throw new Error('Rating must be positive number and less or equal 5');
    const roundedRating = Math.round(rating * 10) / 10;
    return this._copy({ rating: roundedRating });
  }

  public get toPersistence() {
    return {
      title: this.props.title,
      description: this.props.description,
      rating: this.props.rating,
      isFree: this.props.isFree,
      url: this.props.url,
      courseId: this.props.courseId,
      order: this.props.order,
      duration: this.props.duration,
      isDeleted: this.props.isDeleted,
    };
  }

  // for internal use only
  private _copy(props: Partial<LessonProps>): Lesson {
    return new Lesson(
      {
        ...this.props,
        ...props,
        updatedAt: new Date(),
      },
      this.isNew,
    );
  }

  private _required(field: string, reqField: string): string {
    field = field.trim();
    if (!field || field == '') throw new Error(`${reqField} is required`);

    return field;
  }
}
