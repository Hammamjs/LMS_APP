import { IUseCase } from '@/core/common/use-case-interface';
import { CreateUserParams } from './create-user.params';
import type { IUserRepository } from '@/module/users/domain/repositories/user.repository.interface';
import { User } from '../../../domain/entity/user.entity';
import { Inject } from '@nestjs/common';
import { Result } from '@/core/common/result.pattern';
import { IUSER_REPOSITORY } from '@/module/users/domain/constants/injection.token';
import { IBCRYPT_SERVICE } from '@/module/auth/domain/constants/injection.token';
import type { IBcryptService } from '@/module/auth/domain/service/bcrypt.service.interface';
import { Errors, failure } from '@/core/common/err.utils';

export class CreateUserUseCase implements IUseCase<
  CreateUserParams,
  Promise<Result<User>>
> {
  constructor(
    @Inject(IUSER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(IBCRYPT_SERVICE) private readonly bcryptServie: IBcryptService,
  ) {}
  async execute(createUser: CreateUserParams): Promise<Result<User>> {
    if (!createUser.email)
      return failure(Errors.validation('Email is missing'));

    const userResult = await this.userRepo.findByEmail(createUser.email);

    if (!userResult.ok) return userResult;

    if (userResult.ok && userResult.value)
      return failure(Errors.conflict('Eamil already exsits'));

    const hashingPassword = await this.bcryptServie.hash(createUser.password);
    const newUser = User.create(createUser).withPassword(hashingPassword);
    const savedUser = await this.userRepo.save(newUser);

    if (!savedUser.ok) return savedUser;

    return { ok: true, value: savedUser.value };
  }
}
