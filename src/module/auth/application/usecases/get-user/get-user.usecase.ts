import {
  Errors,
  ILOGGER_SERVICE,
  type ILoggerService,
  IUseCase,
  Result,
} from '@/core';
import { IJWTTOKEN_SERVICE } from '@/module/auth/domain/constants/injection.token';
import { type IJWTTokenService } from '@/module/auth/domain/service/token.service.interface';
import { IUSER_REPOSITORY, type IUserRepository } from '@/module/users';
import { UserResponseMapper, type UserResponse } from '@/module/users';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type TResponse = { user: UserResponse; accessToken: string };

@Injectable()
export class GetMeUseCase implements IUseCase<
  string,
  Promise<Result<TResponse>>
> {
  constructor(
    @Inject(IUSER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(IJWTTOKEN_SERVICE) private readonly tokenService: IJWTTokenService,
    private readonly config: ConfigService,
    @Inject(ILOGGER_SERVICE) private readonly logger: ILoggerService,
  ) {}

  async execute(refreshToken: string): Promise<Result<TResponse>> {
    if (!refreshToken) {
      const errorTrack = new Error('Refresh token not Provided');
      this.logger.error(
        errorTrack.message,
        errorTrack.stack,
        GetMeUseCase.name,
      );
      return Result.fail<TResponse>(Errors.validation('Token not provided'));
    }
    const userResult = await this.userRepo.findByToken(refreshToken);

    if (Result.isFail(userResult)) return Result.fail(userResult.error);

    this.logger.log(
      `Server try to reuath user with email ${userResult.value.email}`,
      GetMeUseCase.name,
    );
    const userResponse = UserResponseMapper.toResponse(userResult.value);

    const { email, id, role } = userResponse;

    const accessTokenSecret = this.config.getOrThrow<string>(
      'JWT_ACCESS_TOKEN_SECRET',
    );

    const accessToken = await this.tokenService.generate(
      { email, id, role },
      { secret: accessTokenSecret, expiresIn: '15min' },
    );

    return Result.ok({ user: userResponse, accessToken });
  }
}
