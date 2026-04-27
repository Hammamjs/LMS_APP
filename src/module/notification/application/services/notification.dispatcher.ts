import { Injectable } from '@nestjs/common';
import { Notification } from '../../domain/entity/notification.entity';
import { NotificationGateWay } from '../../infrastructure/getaway/notification.gateway';

@Injectable()
export class NotificationDispatcher {
  constructor(private readonly gateway: NotificationGateWay) {}
  send(notification: Notification) {
    this.gateway.pushToUser(notification.getUserId, {
      id: notification.getId,
      userId: notification.getUserId,
      text: notification.getText,
      title: notification.getTitle,
      isDeleted: notification.getIsDeleted,
      createdAt: notification.getCreatedAt,
      read: notification.getRead,
    });
  }
}
