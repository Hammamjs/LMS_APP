import { type IUserRepository, IUSER_REPOSITORY } from '@/module/users';
import { Inject } from '@nestjs/common';
import { Result, Errors, IUseCase } from '@/core';

export class DeleteUserUseCase implements IUseCase<
  string,
  Promise<Result<void>>
> {
  constructor(
    @Inject(IUSER_REPOSITORY) private readonly userRepo: IUserRepository,
  ) {}

  async execute(id: string): Promise<Result<void>> {
    if (!id) return Result.fail(Errors.validation('Id not provided'));

    const userResult = await this.userRepo.delete(id);

    if (!userResult.ok) return userResult;

    return Result.ok(undefined);
  }
}
