import { Errors, IUseCase, Result } from '@/core';
import { IJWTTOKEN_SERVICE } from '@/module/auth/domain/constants/injection.token';
import { type IJWTTokenService } from '@/module/auth/domain/service/token.service.interface';
import { IUSER_REPOSITORY, type IUserRepository } from '@/module/users';
import { UserResponseMapper, type UserResponse } from '@/module/users';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GetMeUseCase implements IUseCase<
  string,
  Promise<Result<{ user: UserResponse; accessToken: string }>>
> {
  constructor(
    @Inject(IUSER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(IJWTTOKEN_SERVICE) private readonly tokenService: IJWTTokenService,
    private readonly config: ConfigService,
  ) {}

  async execute(
    refreshToken: string,
  ): Promise<Result<{ user: UserResponse; accessToken: string }>> {
    if (!refreshToken)
      return Result.fail(Errors.validation('Token not provided'));
    const userResult = await this.userRepo.findByToken(refreshToken);

    if (!userResult.ok) return userResult;
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
