import { IUseCase, Result } from '@/core';
import {
  NotificationMapper,
  NotificationResponse,
} from '../../mapper/notification.mapper';
import { type INotificationSystemRepository } from '@/module/notification/domain/repository/notification.repository.interface';
import { Inject, Injectable } from '@nestjs/common';
import { INOTIFICATION_REPOSITORY } from '@/module/notification/domain/constant/injection.token';

@Injectable()
export class GetUserNotificationUseCase implements IUseCase<
  string,
  Promise<Result<NotificationResponse>>
> {
  constructor(
    @Inject(INOTIFICATION_REPOSITORY)
    private readonly notificationRepo: INotificationSystemRepository,
  ) {}

  async execute(id: string): Promise<Result<NotificationResponse>> {
    const notificationResult = await this.notificationRepo.findById(id);

    if (!notificationResult.ok) return notificationResult;

    const notification = notificationResult.value;

    const reponse = NotificationMapper.toResponse(notification);

    return Result.ok(reponse);
  }
}
