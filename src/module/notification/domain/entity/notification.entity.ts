import { randomUUID } from 'crypto';
import { NotificationState } from './notification.type';

export class Notification {
  private constructor(private readonly props: NotificationState) {}

  public get id(): string {
    return this.props.id;
  }

  public get title(): string {
    return this.props.title;
  }

  public get text(): string {
    return this.props.text;
  }

  public get read(): boolean {
    return this.props.read;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get userId(): string {
    return this.props.userId;
  }

  public get isDeleted(): boolean {
    return this.props.isDeleted;
  }

  public withTitle(title: string): Notification {
    if (!title || title.trim() == '') throw new Error('Title is required');
    title = title.trim();
    return this._copy({ title });
  }

  public setUserId(userId: string): Notification {
    const trimmedId = userId?.trim();
    if (!trimmedId || !this._isValidId(trimmedId))
      throw new Error('User id not valid');

    return this._copy({ userId: trimmedId });
  }

  public withText(text: string): Notification {
    if (!text && text.trim() == '') throw new Error('text is required');
    text = text.trim();
    return this._copy({ text });
  }

  markAsDeleted(): Notification {
    return this._copy({ isDeleted: true });
  }

  public markAsRead(): Notification {
    return this._copy({ read: true });
  }

  public static create(
    props: Pick<NotificationState, 'text' | 'title' | 'userId'>,
  ): Notification {
    return new Notification({
      id: randomUUID(),
      createdAt: new Date(),
      read: false,
      text: props.text,
      title: props.title,
      userId: props.userId,
      isDeleted: false,
    });
  }

  public static rehydrate(props: NotificationState): Notification {
    return new Notification(props);
  }

  public toPersistence() {
    return {
      id: this.props.id,
      userId: this.props.userId,
      text: this.props.text,
      title: this.props.title,
      read: this.props.read,
      createdAt: this.props.createdAt,
      isDeleted: false,
    };
  }

  private _copy(props?: Partial<NotificationState>): Notification {
    return new Notification({ ...this.props, ...props });
  }

  private _isValidId(id: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      id,
    );
  }
}
