import { IUseCase } from '@/core/common/use-case-interface';
import { User } from '../../../domain/entity/user.entity';
import { UpdateUserParams } from './update-user.params';
import type { IUserRepository } from '@/module/users/domain/repositories/user.repository';
import { Inject, Injectable } from '@nestjs/common';
import { Result } from '@/core/common/result.pattern';
import { Errors, failure } from '@/core/common/err.utils';

@Injectable()
export class UpdateUserUseCase implements IUseCase<
  UpdateUserParams,
  Promise<Result<User | null>>
> {
  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
  ) {}
  async execute(updateUser: UpdateUserParams): Promise<Result<User | null>> {
    if (!updateUser.id)
      return {
        ok: false,
        error: {
          type: 'NOT_FOUND',
          message: 'Id not provided',
        },
      };

    const userResult = await this.userRepo.findOne(updateUser.id);

    if (!userResult.ok) return userResult;

    if (!userResult.value) return failure(Errors.notFound('User not found'));

    const updatedUser = User.create({ ...updateUser, ...userResult.value });

    const savedUser = await this.userRepo.save(updatedUser);

    return savedUser;
  }
}
