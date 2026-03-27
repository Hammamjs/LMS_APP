import { IUseCase } from '@/core/common/use-case-interface';
import { User } from '@/module/users/domain/entity/user.entity';
import type { IUserRepository } from '@/module/users/domain/repositories/user.repository';
import { Inject } from '@nestjs/common';
import { Result } from '@/core/common/result.pattern';

export class DeleteUserUseCase implements IUseCase<
  string,
  Promise<Result<User | null>>
> {
  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
  ) {}

  async execute(id: string): Promise<Result<User | null>> {
    if (!id)
      return {
        ok: false,
        error: { type: 'VALIDATION', message: 'Id not provided' },
      };

    const userResult = await this.userRepo.delete(id);
    if (!userResult.ok) return userResult;
    return userResult;
  }
}
