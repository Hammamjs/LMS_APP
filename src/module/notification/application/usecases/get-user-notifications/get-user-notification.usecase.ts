import { IUseCase, ResponseBuilder, Result } from '@/core';
import {
  NotificationMapper,
  NotificationPaginationResponse,
} from '../../mapper/notification.mapper';
import { type INotificationSystemRepository } from '@/module/notification/domain/repository/notification.repository.interface';
import { NotificationPaginationResult } from '@/module/notification/domain/entity/notification.type';
import { Inject, Injectable } from '@nestjs/common';
import { INOTIFICATION_REPOSITORY } from '@/module/notification/domain/constant/injection.token';

@Injectable()
export class GetUserNotificationsUseCase implements IUseCase<
  NotificationPaginationResult,
  Promise<Result<NotificationPaginationResponse>>
> {
  constructor(
    @Inject(INOTIFICATION_REPOSITORY)
    private readonly notificationRepo: INotificationSystemRepository,
  ) {}

  async execute(
    params: NotificationPaginationResult,
  ): Promise<Result<NotificationPaginationResponse>> {
    const notificationResult = await this.notificationRepo.findAll(params);

    if (!notificationResult.ok) return notificationResult;

    const { data, meta } = notificationResult.value;

    const reponse = ResponseBuilder.paginateMapped(
      data,
      meta,
      NotificationMapper.toResponse,
    );

    return Result.ok(reponse);
  }
}
