import { IUseCase } from '@/core/common/use-case-interface';
import { User } from '../../../domain/entity/user.entity';
import { UpdateUserParams } from './update-user.params';
import type { IUserRepository } from '@/module/users/domain/repositories/user.repository.interface';
import { Inject, Injectable } from '@nestjs/common';
import { Result } from '@/core/common/result.pattern';
import { Errors, failure } from '@/core/common/err.utils';
import { IUSER_REPOSITORY } from '@/module/users/domain/constants/injection.token';

@Injectable()
export class UpdateUserUseCase implements IUseCase<
  UpdateUserParams,
  Promise<Result<User | null>>
> {
  constructor(
    @Inject(IUSER_REPOSITORY) private readonly userRepo: IUserRepository,
  ) {}
  async execute(dto: UpdateUserParams): Promise<Result<User | null>> {
    if (!dto.id)
      return {
        ok: false,
        error: {
          type: 'NOT_FOUND',
          message: 'Id not provided',
        },
      };

    const userResult = await this.userRepo.findOne(dto.id);

    if (!userResult.ok) return userResult;

    if (!userResult.value) return failure(Errors.notFound('User not found'));

    const user = userResult.value;

    const updatedUser = user
      .withUsername(dto.username ?? user.getUsername())
      .withEmail(dto.email ?? user.getEmail())
      .withPhone(dto.phone);

    const savedUser = await this.userRepo.save(updatedUser);

    return savedUser;
  }
}
