import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { EmailVerifiedEvent } from '../../domain/event/email-verified.event';
import { NotificationDispatcher } from '@/module/notification/application/handler/notification.dispatcher';
import {
  INOTIFICATION_REPOSITORY,
  type INotificationSystemRepository,
  Notification,
} from '@/module/notification';
import { Inject } from '@nestjs/common';

@EventsHandler(EmailVerifiedEvent)
export class EmailVerifiedHandler implements IEventHandler<EmailVerifiedEvent> {
  constructor(
    private readonly dispatch: NotificationDispatcher,
    @Inject(INOTIFICATION_REPOSITORY)
    private readonly notiifcation: INotificationSystemRepository,
  ) {}

  async handle(event: EmailVerifiedEvent) {
    const notification = Notification.create({
      userId: event.userId,
      title: 'Email Verified 🎉',
      text: 'Your email has been successfully verified.',
    });

    await this.notiifcation.save(notification);

    this.dispatch.send(notification);
  }
}
