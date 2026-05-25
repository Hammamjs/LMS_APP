import { Injectable } from '@nestjs/common';
import { Notification } from '../../domain/entity/notification.entity';
import { NotificationGateWay } from '../../infrastructure/getaway/notification.gateway';

@Injectable()
export class NotificationDispatcher {
  constructor(private readonly gateway: NotificationGateWay) {}
  send(notification: Notification) {
    this.gateway.pushToUser(notification.userId, {
      id: notification.id,
      userId: notification.userId,
      text: notification.text,
      title: notification.title,
      isDeleted: notification.isDeleted,
      createdAt: notification.createdAt,
      read: notification.read,
    });
  }
}
