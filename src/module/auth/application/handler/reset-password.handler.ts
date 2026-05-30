import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ResetPasswordVerifiedEvent } from '../../domain/events/reset-password-verified.event';
import {
  INOTIFICATION_REPOSITORY,
  type INotificationSystemRepository,
  Notification,
} from '@/module/notification';
import { NotificationDispatcher } from '@/module/notification/application/handler/notification.dispatcher';
import { Inject } from '@nestjs/common';
import { ILOGGER_SERVICE, type ILoggerService } from '@/core';

@EventsHandler(ResetPasswordVerifiedEvent)
export class ResetPasswordHandler implements IEventHandler<ResetPasswordVerifiedEvent> {
  constructor(
    private readonly notificationSys: NotificationDispatcher,
    @Inject(INOTIFICATION_REPOSITORY)
    private readonly notificationRepo: INotificationSystemRepository,
    @Inject(ILOGGER_SERVICE) private readonly logger: ILoggerService,
  ) {}

  async handle(event: ResetPasswordVerifiedEvent) {
    const notification = Notification.create({
      userId: event.userId,
      title: 'Update passowrd',
      text: 'You have update your password recently',
    });

    try {
      // save notification to database
      await this.notificationRepo.save(notification);

      this.notificationSys.send(notification);
    } catch (err) {
      this.logger.error(
        `Failed to push notification to email ${event.email}`,
        err instanceof Error ? err.stack : String(err),
      );
    }
  }
}
