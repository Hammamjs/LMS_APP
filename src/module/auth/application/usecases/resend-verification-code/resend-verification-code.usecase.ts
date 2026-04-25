import type { IUseCase } from '@/core/common/use-case-interface';
import { IUSER_REPOSITORY } from '@/module/users/domain/constants/injection.token';
import type { IUserRepository } from '@/module/users/domain/repositories/user.repository.interface';
import { Result } from '@core/common/result.pattern';
import { Inject, Injectable } from '@nestjs/common';
import { IOTP_REPOSITORY } from '../../../domain/constants/injection.token';
import type { IOTPRepository } from '../../../domain/repository/otp.repsoitory.interface';
import { Errors, failure } from '@/core/common/err.utils';
import { createHash } from 'crypto';
import { ResendVerificaionCodeParam } from './resend-verification-code.param';
import { EventBus } from '@nestjs/cqrs';
import { ResendVerificationCodeRequestedEvent } from '@/module/auth/domain/events/resend-verification-code-requested.event';

@Injectable()
export class ResendVerificationCodeUseCase implements IUseCase<
  ResendVerificaionCodeParam,
  Promise<Result<string>>
> {
  constructor(
    @Inject(IUSER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(IOTP_REPOSITORY) private readonly otpRepository: IOTPRepository,
    private readonly eventPublisher: EventBus,
  ) {}

  async execute(dto: ResendVerificaionCodeParam): Promise<Result<string>> {
    const userResult = await this.userRepo.findByEmail(dto.email);
    if (!userResult.ok) return failure(Errors.notFound('Email not found'));

    const user = userResult.value;
    if (user.getIsVerified())
      return failure(Errors.validation('Email already verified'));

    const generateNewCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    const hashedNewCode = createHash('sha256')
      .update(generateNewCode)
      .digest('hex');

    // save it to redis and send code in user email

    await this.otpRepository.setResetCode(
      `verify:${user.getId()}`,
      hashedNewCode,
      600,
    );

    // Trigger event
    this.eventPublisher.publish(
      new ResendVerificationCodeRequestedEvent(
        user.getEmail(),
        generateNewCode,
      ),
    );

    return {
      ok: true,
      value: 'Verification code was sent.',
    };
  }
}
