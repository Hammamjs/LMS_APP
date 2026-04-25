import { IUseCase } from '@/core/common/use-case-interface';
import type { IUserRepository } from '@/module/users/domain/repositories/user.repository.interface';
import { Inject } from '@nestjs/common';
import { Result } from '@/core/common/result.pattern';
import { IUSER_REPOSITORY } from '@/module/users/domain/constants/injection.token';

export class DeleteUserUseCase implements IUseCase<
  string,
  Promise<Result<void>>
> {
  constructor(
    @Inject(IUSER_REPOSITORY) private readonly userRepo: IUserRepository,
  ) {}

  async execute(id: string): Promise<Result<void>> {
    if (!id)
      return {
        ok: false,
        error: { type: 'VALIDATION', message: 'Id not provided' },
      };

    const userResult = await this.userRepo.delete(id);

    if (!userResult.ok) return userResult;

    return {
      ok: true,
      value: undefined,
    };
  }
}
