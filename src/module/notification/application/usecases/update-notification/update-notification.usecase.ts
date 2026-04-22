import { Errors, IUseCase, Result } from '@/core';
import { Inject, Injectable } from '@nestjs/common';
import {
  NotificationMapper,
  NotificationResponse,
} from '../../mapper/notification.mapper';
import { type INotificationSystemRepository } from '@/module/notification/domain/repository/notification.repository.interface';
import { INOTIFICATION_REPOSITORY } from '@/module/notification/domain/constant/injection.token';

@Injectable()
export class UpdateNotificationUseCase implements IUseCase<
  string,
  Promise<Result<NotificationResponse>>
> {
  constructor(
    @Inject(INOTIFICATION_REPOSITORY)
    private readonly notificationRepo: INotificationSystemRepository,
  ) {}

  async execute(id: string): Promise<Result<NotificationResponse>> {
    const NotificationResult = await this.notificationRepo.findById(id);

    if (!NotificationResult.ok)
      return Result.fail(Errors.notFound('Notification not found'));

    const notification = NotificationResult.value;

    const markAsRead = notification.markAsRead();

    const updateInDb = await this.notificationRepo.save(markAsRead);

    if (!updateInDb.ok)
      return Result.fail(Errors.internal('Update in notification failed'));

    const response = NotificationMapper.toResponse(notification);

    return Result.ok(response);
  }
}
