import { IUseCase } from 'src/core/common/use-case-interface';
import type { IUserRepository } from '@/module/users/domain/repositories/user.repository.interface';
import { User } from '@/module/users/domain/entity/user.entity';
import { Inject, Injectable } from '@nestjs/common';
import { Result } from '@/core/common/result.pattern';
import { IUSER_REPOSITORY } from '@/module/users/domain/constants/injection.token';

@Injectable()
export class FindAllUsersUseCase implements IUseCase<
  void,
  Promise<Result<User[]>>
> {
  constructor(
    @Inject(IUSER_REPOSITORY) private readonly userRepo: IUserRepository,
  ) {}
  async execute(): Promise<Result<User[]>> {
    const result = await this.userRepo.findAll();

    if (!result.ok) return result;

    return { ok: true, value: result.value };
  }
}
