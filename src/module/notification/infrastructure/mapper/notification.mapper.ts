import { Notification as PrismaNotificaion } from '@prisma/client';
import { Notification } from '../../domain/entity/notification.entity';
export class NotificationMapper {
  private constructor() {}
  static toDomain(rawNotification: PrismaNotificaion) {
    return Notification.rehydrate(rawNotification);
  }
}
