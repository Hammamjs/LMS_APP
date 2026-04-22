import { Errors, IUseCase, Result } from '@/core';
import { INOTIFICATION_REPOSITORY } from '@/module/notification/domain/constant/injection.token';
import { type INotificationSystemRepository } from '@/module/notification/domain/repository/notification.repository.interface';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class UpdateNotificationsUseCase implements IUseCase<
  string[],
  Promise<Result<void>>
> {
  constructor(
    @Inject(INOTIFICATION_REPOSITORY)
    private readonly notificationRepo: INotificationSystemRepository,
  ) {}

  async execute(params: string[]): Promise<Result<void>> {
    if (!params || params.length)
      return Result.fail(Errors.validation('No notification IDs provided'));

    return await this.notificationRepo.markAllAsRead(params);
  }
}
