import { Errors, IUseCase, Result } from '@/core';
import { UpdatePasswordParams } from './update-password.params';
import { Inject, Injectable } from '@nestjs/common';
import { IUSER_REPOSITORY, type IUserRepository } from '@/module/users';
import { IBCRYPT_SERVICE, type IBcryptService } from '@/module/auth';

type TResponse = { message: string };

@Injectable()
export class UpdatePasswordUseCase implements IUseCase<
  UpdatePasswordParams,
  Promise<Result<TResponse>>
> {
  constructor(
    @Inject(IUSER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(IBCRYPT_SERVICE) private readonly bcryptService: IBcryptService,
  ) {}

  async execute(params: UpdatePasswordParams): Promise<Result<TResponse>> {
    const userResult = await this.userRepo.findById(params.id);

    if (Result.isFail(userResult))
      return Result.fail<TResponse>(userResult.error);

    const user = userResult.value;

    const isPasswordsMatch = await this.bcryptService.compare(
      params.currentPassword,
      user.hashedPassword,
    );

    if (!isPasswordsMatch)
      return Result.fail<TResponse>(
        Errors.validation('Incorrect current password'),
      );

    const hashedPassword = await this.bcryptService.hash(params.newPassword);

    const updateUserPassword = user.withPassword(hashedPassword);

    const saveUserPassword = await this.userRepo.save(updateUserPassword);

    if (Result.isFail(saveUserPassword))
      return Result.fail<TResponse>(
        Errors.internal('Failed to update password'),
      );

    return Result.ok({ message: 'Password updated succesfully' });
  }
}
