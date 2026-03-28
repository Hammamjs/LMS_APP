import { IUseCase } from '@/core/common/use-case-interface';
import { VerifyEmailParams } from './verify-email.params';
import { Result } from '@/core/common/result.pattern';
import { IUserRepository } from '@/module/users/domain/repositories/user.repository';
import { User } from '@/module/users/domain/entity/user.entity';

export class VerifyEmail implements IUseCase<
  VerifyEmailParams,
  Promise<Result<string>>
> {
  constructor(public readonly userRepo: IUserRepository) {}
  async execute(dto: VerifyEmailParams): Promise<Result<string>> {
    const userResult = await this.userRepo.findByEmail(dto.email);

    if (!userResult.ok || !userResult.value)
      return {
        ok: false,
        error: { type: 'NOT_FOUND', message: 'User not exists' },
      };

    const verifyUser = User.create(userResult.value);

    // at this step we need to hashing the password before
    // save it to data base or to the entity

    // save hashed password
    verifyUser?.withPassword(dto.password);

    await this.userRepo.save(verifyUser);

    return {
      ok: true,
      value: 'Email verified successfully',
    };
  }
}
