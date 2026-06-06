import { IUseCase, Result, Errors } from '@/core';
import { CreateUserParams } from './create-user.params';
import type { IUserRepository } from '@/module/users/domain/repositories/user.repository.interface';
import { User } from '../../../domain/entity/user.entity';
import { Inject } from '@nestjs/common';
import { IUSER_REPOSITORY } from '@/module/users';
import { IBCRYPT_SERVICE, type IBcryptService } from '@/module/auth';
import {
  UserResponse,
  UserResponseMapper,
} from '../../mapper/user-response.mapper';

export class CreateUserUseCase implements IUseCase<
  CreateUserParams,
  Promise<Result<UserResponse>>
> {
  constructor(
    @Inject(IUSER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(IBCRYPT_SERVICE) private readonly bcryptServie: IBcryptService,
  ) {}
  async execute(createUser: CreateUserParams): Promise<Result<UserResponse>> {
    if (!createUser.email)
      return Result.fail<UserResponse>(Errors.validation('Email is missing'));

    const userResult = await this.userRepo.findByEmail(createUser.email);

    if (userResult.ok && userResult.value)
      return Result.fail<UserResponse>(Errors.conflict('Eamil already exsits'));

    const hashingPassword = await this.bcryptServie.hash(createUser.password);
    const newUser = User.create(createUser).withPassword(hashingPassword);
    const savedUser = await this.userRepo.save(newUser);

    if (Result.isFail(savedUser)) return Result.fail(savedUser.error);

    const toResponse = UserResponseMapper.toResponse(savedUser.value);

    return Result.ok(toResponse);
  }
}
