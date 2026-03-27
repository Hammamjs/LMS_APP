import { IUseCase } from '@/core/common/use-case-interface';
import { CreateUserParams } from './create-user.params';
import type { IUserRepository } from '@/module/users/domain/repositories/user.repository';
import { User } from '../../../domain/entity/user.entity';
import { Inject } from '@nestjs/common';
import { Result } from '@/core/common/result.pattern';

export class CreateUserUseCase implements IUseCase<
  CreateUserParams,
  Promise<Result<User>>
> {
  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
  ) {}
  async execute(createUser: CreateUserParams): Promise<Result<User>> {
    const userResult = await this.userRepo.findByEmail(createUser.email);
    if (!userResult.ok) return userResult;

    if (userResult.value) {
      return {
        ok: false,
        error: {
          type: 'CONFLICT',
          message: 'Emsil is already exists',
        },
      };
    }

    const newUser = User.create(createUser);
    const savedUser = await this.userRepo.save(newUser);

    if (!savedUser.ok) return savedUser;

    return { ok: true, value: savedUser.value };
  }
}
