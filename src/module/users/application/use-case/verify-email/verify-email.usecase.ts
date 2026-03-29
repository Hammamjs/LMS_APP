import { IUseCase } from '@/core/common/use-case-interface';
import { VerifyEmailParams } from './verify-email.params';
import { Result } from '@/core/common/result.pattern';
import type { IUserRepository } from '@/module/users/domain/repositories/user.repository.interface';
import { Inject, Injectable } from '@nestjs/common';
import { IUSER_REPOSITORY } from '@/module/users/domain/constants/injection.token';
import { failure } from '@/core/common/err.utils';
@Injectable()
export class VerifyEmail implements IUseCase<
  VerifyEmailParams,
  Promise<Result<string>>
> {
  constructor(
    @Inject(IUSER_REPOSITORY) public readonly userRepo: IUserRepository,
  ) {}
  async execute(dto: VerifyEmailParams): Promise<Result<string>> {
    const userResult = await this.userRepo.findByEmail(dto.email);

    if (!userResult.ok || !userResult.value)
      return {
        ok: false,
        error: { type: 'NOT_FOUND', message: 'User not exists' },
      };

    const user = userResult.value;

    if (user.getIsVerified())
      return { ok: true, value: 'Email already verified' };

    const updatedUser = user.verify();

    const saveResult = await this.userRepo.save(updatedUser);

    if (!saveResult.ok) return failure(saveResult.error);

    return {
      ok: true,
      value: 'Email verified successfully',
    };
  }
}
