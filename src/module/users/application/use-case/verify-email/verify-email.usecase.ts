import { IUseCase } from '@/core/common/domain/use-case-interface';
import { VerifyEmailParams } from './verify-email.params';
import { Result } from '@/core/common/domain/result.pattern';
import type { IUserRepository } from '@/module/users/domain/repositories/user.repository.interface';
import { Inject, Injectable } from '@nestjs/common';
import { IUSER_REPOSITORY } from '@/module/users/domain/constants/injection.token';
import { Errors, failure } from '@/core/common/domain/err.utils';
import { EventBus } from '@nestjs/cqrs';
import { EmailVerifiedEvent } from '@/module/users/domain/event/email-verified.event';

@Injectable()
export class VerifyEmail implements IUseCase<
  VerifyEmailParams,
  Promise<Result<string>>
> {
  constructor(
    @Inject(IUSER_REPOSITORY) public readonly userRepo: IUserRepository,
    private readonly eventBus: EventBus,
  ) {}
  async execute(dto: VerifyEmailParams): Promise<Result<string>> {
    const userResult = await this.userRepo.findByEmail(dto.email);

    if (!userResult.ok || !userResult.value)
      return Result.fail(Errors.notFound('User not exists'));

    const user = userResult.value;

    if (user.isVerified) return Result.ok('Email already verified');

    const updatedUser = user.verify();

    const saveResult = await this.userRepo.save(updatedUser);

    if (!saveResult.ok) return failure(saveResult.error);

    // DDE
    this.eventBus.publish(new EmailVerifiedEvent(user.id, user.email));

    return Result.ok('Email verified successfully');
  }
}
