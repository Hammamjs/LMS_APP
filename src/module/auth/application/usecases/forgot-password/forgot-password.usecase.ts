import { IUseCase } from '@/core/common/domain/use-case-interface';
import { ForgotPasswordRequest } from './forgot-password.request';
import { Result } from '@/core/common/domain/result.pattern';
import type { IUserRepository } from '@/module/users/domain/repositories/user.repository.interface';
import { Inject } from '@nestjs/common';
import { IUSER_REPOSITORY } from '@/module/users/domain/constants/injection.token';
import { createHash } from 'crypto';
import { IOTP_REPOSITORY } from '@/module/auth/domain/constants/injection.token';
import { Errors, failure } from '@/core/common/domain/err.utils';
import type { IOTPRepository } from '@/module/auth/domain/repository/otp.repsoitory.interface';
import { EventBus } from '@nestjs/cqrs';
import { ResetPasswordRequestedEvent } from '@/module/auth/domain/events/reset-password-requested.event';

export class ForgotPasswordUseCase implements IUseCase<
  ForgotPasswordRequest,
  Promise<Result<string>>
> {
  constructor(
    @Inject(IUSER_REPOSITORY) private readonly userRep: IUserRepository,
    @Inject(IOTP_REPOSITORY) private readonly otpRep: IOTPRepository,
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
        return failure(
          Errors.validation('Password was reset recently try later'),
        );
    }
    // Generate code
    const generateCode = Math.floor(100000 + Math.random() * 900000).toString();
    // Hashed code
    const hashedCode = createHash('sha256').update(generateCode).digest('hex');

    // save code in redis
    await this.otpRep.setResetCode(
      `reset_password:${user.getId()}`,
      hashedCode,
      600,
    );

    // trigger email event
    this.eventPublisher.publish(
      new ResetPasswordRequestedEvent(user.getEmail(), generateCode),
    );

    return {
      ok: true,
      value: 'Code successfully sent to your email',
    };
  }
}
