import { ApiPaginateResponse } from '@/core';
import { Notification } from '../../domain/entity/notification.entity';

export class NotificationMapper {
  private constructor() {}

  static toResponse(this: void, notification: Notification) {
    return {
      id: notification.getId,
      text: notification.getText,
      title: notification.getTitle,
      read: notification.getRead,
      createdAt: notification.getCreatedAt,
    };
  }
}

export type NotificationResponse = ReturnType<
  typeof NotificationMapper.toResponse
>;

export type NotificationPaginationResponse =
  ApiPaginateResponse<NotificationResponse>;
