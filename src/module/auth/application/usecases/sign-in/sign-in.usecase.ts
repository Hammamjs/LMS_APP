import { IUseCase } from '@/core/common/domain/use-case-interface';
import { User } from '@/module/users/domain/entity/user.entity';
import { SignInParam } from './sign-in.params';
import { Result } from '@/core/common/domain/result.pattern';
import type { IBcryptService } from '../../../domain/service/bcrypt.service.interface';
import type { IJWTTokenService } from '../../../domain/service/token.service.interface';
import type { IUserRepository } from '@/module/users/domain/repositories/user.repository.interface';
import { Inject, Injectable } from '@nestjs/common';
import { Errors } from '@/core/common/domain/err.utils';
import { ConfigService } from '@nestjs/config';
import { IUSER_REPOSITORY } from '@/module/users/domain/constants/injection.token';
import {
  IBCRYPT_SERVICE,
  IJWTTOKEN_SERVICE,
} from '@/module/auth/domain/constants/injection.token';

@Injectable()
export class SignInUseCase implements IUseCase<
  SignInParam,
  Promise<Result<{ user: User; accessToken: string; refreshToken: string }>>
> {
  constructor(
    @Inject(IBCRYPT_SERVICE)
    private readonly bcrypteService: IBcryptService,
    @Inject(IJWTTOKEN_SERVICE)
    private readonly tokenService: IJWTTokenService,
    @Inject(IUSER_REPOSITORY)
    private readonly userRepo: IUserRepository,
    private readonly config: ConfigService,
  ) {}

  async execute(
    dto: SignInParam,
  ): Promise<
    Result<{ user: User; accessToken: string; refreshToken: string }>
  > {
    const userResult = await this.userRepo.findByEmail(dto.email);
    console.log(userResult);

    if (!userResult.ok) return userResult;

    const rawUser = userResult.value;

    if (!rawUser.getIsVerified())
      return Result.fail(Errors.validation('Email not verified'));

    // Compare passwords
    const isMatch = await this.bcrypteService.compare(
      dto.password,
      rawUser.getHashedPassword(),
    );

    if (!isMatch)
      return Result.fail(Errors.validation('Incorrect Email or password'));

    if (!rawUser.getId())
      return Result.fail(
        Errors.internal('Pleas re-loggin internal issue occur'),
      );

    // we need to issue token for sign in user
    // if the user reach this point

    const accessTokenSecret = this.config.getOrThrow<string>(
      'JWT_ACCESS_TOKEN_SECRET',
    );

    const refreshTokenSecret = this.config.getOrThrow<string>(
      'JWT_REFRESH_TOKEN_SECRET',
    );

    const id = rawUser.getId();
    const email = rawUser.getEmail();
    const role = rawUser.getRole();

    const accessToken = await this.tokenService.generate(
      { id, role, email },
      { expiresIn: '15min', secret: accessTokenSecret },
    );

    const refreshToken = await this.tokenService.generate(
      { id, role, email },
      { expiresIn: '7d', secret: refreshTokenSecret },
    );

    const hashingRefreshToken = await this.bcrypteService.hash(refreshToken);

    const updatedUser = rawUser.updateRefreshToken(hashingRefreshToken);

    await this.userRepo.save(updatedUser);

    return Result.ok({ user: updatedUser, accessToken, refreshToken });
  }
}
