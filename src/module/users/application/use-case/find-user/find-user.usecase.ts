import { Inject, Injectable } from '@nestjs/common';
import { Result, IUseCase, Errors } from '@/core';
import {
  IUSER_REPOSITORY,
  UserResponse,
  UserResponseMapper,
  type IUserRepository,
} from '@/module/users';

@Injectable()
export class FindUserUseCase implements IUseCase<
  string,
  Promise<Result<UserResponse>>
> {
  constructor(
    @Inject(IUSER_REPOSITORY) private readonly userRepo: IUserRepository,
  ) {}

  async execute(id: string): Promise<Result<UserResponse>> {
    const userResult = await this.userRepo.findById(id);

    if (Result.isFail(userResult))
      return Result.fail<UserResponse>(userResult.error);

    if (!userResult.value)
      return Result.fail<UserResponse>(Errors.notFound('User not found'));

    const toResponse = UserResponseMapper.toResponse(userResult.value);

    return Result.ok(toResponse);
  }
}
