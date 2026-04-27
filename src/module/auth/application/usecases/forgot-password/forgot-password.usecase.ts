import { Inject } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { createHash } from 'crypto';
import { IUseCase, Errors, Result } from '@/core';
import { ForgotPasswordRequest } from './forgot-password.request';
import type { IUserRepository } from '@/module/users/domain/repositories/user.repository.interface';
import { IUSER_REPOSITORY } from '@/module/users/domain/constants/injection.token';
import { ICACHE_REPOSITORY } from '@/module/auth/domain/constants/injection.token';
import type { ICacheRepository } from '@/module/auth/domain/repository/cache.repsoitory.interface';
import { ResetPasswordRequestedEvent } from '@/module/auth/domain/events/reset-password-requested.event';

export class ForgotPasswordUseCase implements IUseCase<
  ForgotPasswordRequest,
  Promise<Result<string>>
> {
  constructor(
    @Inject(IUSER_REPOSITORY) private readonly userRep: IUserRepository,
    @Inject(ICACHE_REPOSITORY) private readonly cacheRepo: ICacheRepository,
    private readonly eventPublisher: EventBus,
  ) {}
  async execute(dto: ForgotPasswordRequest): Promise<Result<string>> {
    const userResult = await this.userRep.findByEmail(dto.email);

    if (!userResult.ok) return userResult;

    const user = userResult.value;

    const passwordUpdated = user.getPasswordUpdatedAt();

    if (passwordUpdated) {
      const now = new Date();
      const diffMs = now.getTime() - passwordUpdated.getTime();

      const THIRTY_MINS = 30 * 60 * 1000;
      // block user to update for 30mins
      if (diffMs <= THIRTY_MINS)
        return Result.fail(
          Errors.validation('Password was reset recently try later'),
        );
    }
    // Generate code
    const generateCode = Math.floor(100000 + Math.random() * 900000).toString();
    // Hashed code
    const hashedCode = createHash('sha256').update(generateCode).digest('hex');

    // save code in redis
    await this.cacheRepo.set(`reset_password:${user.getId()}`, hashedCode, 600);

    // trigger email event
    this.eventPublisher.publish(
      new ResetPasswordRequestedEvent(user.getEmail(), generateCode),
    );

    return Result.ok('Code successfully sent to your email');
  }
}
