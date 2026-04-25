import { PaginationResult, Result } from '@core/index';
import { NotificationPaginationResult } from '../entity/notification.type';
import { Notification } from '../entity/notification.entity';

export interface INotificationSystemRepository {
  findAll: (
    params: NotificationPaginationResult,
  ) => Promise<Result<PaginationResult<Notification>>>;

  findById: (id: string) => Promise<Result<Notification>>;

  // update all messages as read
  markAllAsRead: (ids: string[]) => Promise<Result<void>>;

  save: (notification: Notification) => Promise<Result<Notification>>;

  saveMany: (notifications: Notification[]) => Promise<Result<void>>;
  // soft deletion
  delete: (id: string) => Promise<Result<void>>;

  // delete all messages
  deleteAll: (ids: string[]) => Promise<Result<void>>;
}
