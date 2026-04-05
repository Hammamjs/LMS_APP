import { randomUUID } from 'crypto';
import { LessonProps, LessonState } from '../lesson.type';

export class Lesson {
  private constructor(
    private props: LessonState,
    private isNew: boolean,
  ) {}

  public static create(
    props: Omit<LessonProps, 'id' | 'createdAt' | 'updatedAt'>,
  ): Lesson {
    return new Lesson(
      {
        ...props,
        id: randomUUID(),
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

  public getUrl(): string | null {
    return this.props.url;
  }

  public getVideo(): string | null {
    return this.props.video;
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
}
