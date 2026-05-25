import { Inject, Injectable } from '@nestjs/common';
import { IUseCase, Errors, Result } from '@/core';
import { IUSER_REPOSITORY, type IUserRepository } from '@/module/users';
import { UpdateUserParams } from './update-user.params';
import {
  UserResponse,
  UserResponseMapper,
} from '../../mapper/user-response.mapper';

@Injectable()
export class UpdateUserUseCase implements IUseCase<
  UpdateUserParams,
  Promise<Result<UserResponse>>
> {
  constructor(
    @Inject(IUSER_REPOSITORY) private readonly userRepo: IUserRepository,
  ) {}
  async execute(dto: UpdateUserParams): Promise<Result<UserResponse>> {
    if (!dto.id) return Result.fail(Errors.validation('Id not provided'));

    const userResult = await this.userRepo.findById(dto.id);

    if (!userResult.ok) return userResult;

    if (!userResult.value)
      return Result.fail(Errors.notFound('User not found'));

    const user = userResult.value;

    const updatedUser = user
      .withUsername(dto.username ?? user.username)
      .withEmail(dto.email ?? user.email)
      .withPhone(dto.phone)
      .withAvatar(dto.avatar ?? user.avatar);

    const savedUser = await this.userRepo.save(updatedUser);

    if (!savedUser.ok) return savedUser;

    const toResponse = UserResponseMapper.toResponse(savedUser.value);

    return Result.ok(toResponse);
  }
}
