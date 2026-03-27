import { IUseCase } from '@/core/common/use-case-interface';
import { User } from '@/module/users/domain/entity/user.entity';
import type { IUserRepository } from '@/module/users/domain/repositories/user.repository';
import { Inject, Injectable } from '@nestjs/common';
import { Result } from '@/core/common/result.pattern';
import { Errors, failure } from '@/core/common/err.utils';

@Injectable()
export class FindUserUseCase implements IUseCase<
  string,
  Promise<Result<User>>
> {
  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
  ) {}

  async execute(id: string): Promise<Result<User>> {
    const userResult = await this.userRepo.findOne(id);

    if (!userResult.ok) return userResult;

    if (!userResult.value) return failure(Errors.notFound('User not found'));

    return { ok: true, value: userResult.value };
  }
}
