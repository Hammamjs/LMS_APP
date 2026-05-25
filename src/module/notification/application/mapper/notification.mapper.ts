import { ApiPaginateResponse } from '@/core';
import { Notification } from '../../domain/entity/notification.entity';

export class NotificationMapper {
  private constructor() {}

  static toResponse(this: void, notification: Notification) {
    return {
      id: notification.id,
      text: notification.text,
      title: notification.title,
      read: notification.read,
      createdAt: notification.createdAt,
    };
  }
}

export type NotificationResponse = ReturnType<
  typeof NotificationMapper.toResponse
>;

export type NotificationPaginationResponse =
  ApiPaginateResponse<NotificationResponse>;
