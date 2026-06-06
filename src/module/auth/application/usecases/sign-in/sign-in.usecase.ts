import { IUseCase } from '@/core/common/domain/use-case-interface';
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
import { ILOGGER_SERVICE, type ILoggerService } from '@/core';
import { UserResponse, UserResponseMapper } from '@/module/users';

type SignInType = {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
};
@Injectable()
export class SignInUseCase implements IUseCase<
  SignInParam,
  Promise<Result<SignInType>>
> {
  constructor(
    @Inject(IBCRYPT_SERVICE)
    private readonly bcrypteService: IBcryptService,
    @Inject(IJWTTOKEN_SERVICE)
    private readonly tokenService: IJWTTokenService,
    @Inject(IUSER_REPOSITORY)
    private readonly userRepo: IUserRepository,
    @Inject(ILOGGER_SERVICE) private readonly logger: ILoggerService,
    private readonly config: ConfigService,
  ) {}

  async execute(dto: SignInParam): Promise<Result<SignInType>> {
    this.logger.log(`${dto.email} Try to sign in`, SignInUseCase.name);
    const userResult = await this.userRepo.findByEmail(dto.email);

    if (Result.isFail(userResult))
      return Result.fail<SignInType>(userResult.error);

    const rawUser = userResult.value;

    if (!rawUser.isVerified)
      return Result.fail<SignInType>(Errors.validation('Email not verified'));

    // Compare passwords
    const isMatch = await this.bcrypteService.compare(
      dto.password,
      rawUser.hashedPassword,
    );

    if (!isMatch) {
      this.logger.error(
        `Invalid login attempt for ${rawUser.email}`,
        SignInUseCase.name,
      );
      return Result.fail<SignInType>(
        Errors.validation('Incorrect Email or password'),
      );
    }

    if (!rawUser.id)
      return Result.fail<SignInType>(
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

    const id = rawUser.id;
    const email = rawUser.email;
    const role = rawUser.role;

    const accessToken = await this.tokenService.generate(
      { id, role, email },
      { expiresIn: '15min', secret: accessTokenSecret },
    );

    const refreshToken = await this.tokenService.generate(
      { id, role, email },
      { expiresIn: '7d', secret: refreshTokenSecret },
    );

    const updatedUser = rawUser.updateRefreshToken(refreshToken);

    const userResponse = UserResponseMapper.toResponse(updatedUser);

    await this.userRepo.save(updatedUser);

    return Result.ok({ user: userResponse, accessToken, refreshToken });
  }
}
