import { IUseCase, Result } from '@/core';
import { Inject, Injectable } from '@nestjs/common';
import { type INotificationSystemRepository } from '@/module/notification/domain/repository/notification.repository.interface';
import { INOTIFICATION_REPOSITORY } from '@/module/notification/domain/constant/injection.token';

@Injectable()
export class DeleteNotificationUsecase implements IUseCase<
  string,
  Promise<Result<void>>
> {
  constructor(
    @Inject(INOTIFICATION_REPOSITORY)
    private readonly notificationRepo: INotificationSystemRepository,
  ) {}

  async execute(id: string): Promise<Result<void>> {
    await this.notificationRepo.delete(id);
    return Result.ok(undefined);
  }
}
