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
      },
      true,
    );
  }

  public static rehydrate(props: LessonProps): Lesson {
    return new Lesson(props, false);
  }

  public getId(): string {
    return this.props.id;
  }

  public getTitle(): string {
    return this.props.title;
  }

  public getDescription(): string {
    return this.props.description;
  }

  public getOrder(): number {
    return this.props.order;
  }

  public getSourceLink(): string | null {
    return this.props.sourceLink;
  }

  public getVideo(): string | null {
    return this.props.video;
  }

  public isDeletedLesson(): boolean {
    return this.props.isDeleted;
  }

  public getIsFree(): boolean {
    return this.props.isFree;
  }

  public getRating(): number {
    return this.props.rating;
  }

  public getCreatedAt(): Date {
    return this.props.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  public getCourseId(): string {
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

  public withVideo(newVideo: string): Lesson {
    const video = this._required(newVideo, 'Video');

    return this._copy({ video });
  }

  public withUrl(newSourceLink: string): Lesson {
    const sourceLink = this._required(newSourceLink, 'Url');

    return this._copy({ sourceLink });
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

  public updateAverageRating(rating: number) {
    if (typeof rating !== 'number' || rating < 0 || rating > 5)
      throw new Error('Rating must be positive number and less or equal 5');
    const roundedRating = Math.round(rating * 10) / 10;
    return this._copy({ rating: roundedRating });
  }

  public toPersistence() {
    return {
      title: this.props.title,
      description: this.props.description,
      rating: this.props.rating,
      isFree: this.props.isFree,
      sourceLink: this.props.sourceLink,
      video: this.props.video,
      courseId: this.props.courseId,
      order: this.props.order,
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
