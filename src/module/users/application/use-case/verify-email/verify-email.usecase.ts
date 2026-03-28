import { IUseCase } from '@/core/common/use-case-interface';
import { VerifyEmailParams } from './verify-email.params';
import { Result } from '@/core/common/result.pattern';
import { IUserRepository } from '@/module/users/domain/repositories/user.repository';
import { User } from '@/module/users/domain/entity/user.entity';

export class VerifyEmail implements IUseCase<
  VerifyEmailParams,
  Promise<Result<{ message: string }>>
> {
  constructor(public readonly userRepo: IUserRepository) {}
  async execute(dto: VerifyEmailParams): Promise<Result<{ message: string }>> {
    const userResult = await this.userRepo.findByEmail(dto.email);

    if (!userResult.ok)
      return {
        ok: false,
        error: { type: 'NOT_FOUND', message: 'User not exists' },
      };

    const verifyUser =
      userResult.ok && userResult.value ? User.create(userResult.value) : null;

      const generatePassword = 

    const activateUser = await this.userRepo.save();
  }
}
