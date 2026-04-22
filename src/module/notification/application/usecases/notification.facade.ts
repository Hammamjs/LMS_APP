import { Injectable } from '@nestjs/common';
import { GetUserNotificationUseCase } from './get-user-notification/get-user-notification.usecase';
import { GetUserNotificationsUseCase } from './get-user-notifications/get-user-notification.usecase';
import { DeleteNotificationUsecase } from './delete-notification/delete-notification.usecase';
import { DeleteMultipleNotificationUseCase } from './delete-multiple-notifications/delete-multiple-notifications.usecase';
import { UpdateNotificationUseCase } from './update-notification/update-notification.usecase';
import { UpdateNotificationsUseCase } from './update-notifications/update-notifications.usecase';

@Injectable()
export class NotificationFacade {
  constructor(
    public readonly getNotification: GetUserNotificationUseCase,
    public readonly getNotifications: GetUserNotificationsUseCase,
    public readonly deleteOne: DeleteNotificationUsecase,
    public readonly deleteAll: DeleteMultipleNotificationUseCase,
    public readonly updateNotification: UpdateNotificationUseCase,
    public readonly updateNotifications: UpdateNotificationsUseCase,
  ) {}
}
