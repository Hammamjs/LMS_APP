import { Errors, failure } from '@/core/common/domain/err.utils';
import { IUseCase } from '@/core/common/domain/use-case-interface';
import {
  IBCRYPT_SERVICE,
  IJWTTOKEN_SERVICE,
} from '@/module/auth/domain/constants/injection.token';
import type { IBcryptService } from '@/module/auth/domain/service/bcrypt.service.interface';
import type { IJWTTokenService } from '@/module/auth/domain/service/token.service.interface';
import { IUSER_REPOSITORY } from '@/module/users/domain/constants/injection.token';
import type { IUserRepository } from '@/module/users/domain/repositories/user.repository.interface';
import { Result } from '@/core/common/domain/result.pattern';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RefreshTokenUseCase implements IUseCase<
  string,
  Promise<Result<{ refreshToken: string; accessToken: string }>>
> {
  constructor(
    @Inject(IUSER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(IBCRYPT_SERVICE) private readonly bcryptService: IBcryptService,
    @Inject(IJWTTOKEN_SERVICE) private readonly tokenServie: IJWTTokenService,
    private readonly config: ConfigService,
  ) {}

  async execute(
    oldRefreshToken: string,
  ): Promise<Result<{ refreshToken: string; accessToken: string }>> {
    const secret = this.config.getOrThrow<string>('JWT_REFRESH_TOKEN_SECRET');

    const verifyingToken = await this.tokenServie.verify(
      oldRefreshToken,
      secret,
    );

    if (!verifyingToken)
      return failure(Errors.unauthroized('Invalid or expired refreshToken'));

    const payload = {
      id: verifyingToken.id,
      email: verifyingToken.email,
      role: verifyingToken.role,
    };

    if (!payload) return failure(Errors.validation('Invalid token signature'));

    const userResult = await this.userRepo.findByEmail(payload.email);

    if (!userResult.ok)
      return failure(Errors.notFound('User not found it may be deleted'));

    const user = userResult.value;

    const hashedTokenInDb = user.getRefreshToken();

    const isTokensMatched = hashedTokenInDb
      ? await this.bcryptService.compare(oldRefreshToken, hashedTokenInDb)
      : false;

    if (!isTokensMatched) {
      const removeRefreshToken = user.updateRefreshToken(null);
      await this.userRepo.save(removeRefreshToken);
      return failure(Errors.unauthroized('Session expired or compromised'));
    }

    if (!user) return failure(Errors.unauthroized('User not authorized'));

    // generate new rotation
    const tokens = await this.tokenServie.generateAuthToken(payload);

    // we need to hash refresh token before save it to database
    const newHashRefreshToken = await this.bcryptService.hash(
      tokens.refreshToken,
    );

    const updateUserRefreshToken = user.updateRefreshToken(newHashRefreshToken);

    await this.userRepo.save(updateUserRefreshToken);

    return {
      ok: true,
      value: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    };
  }
}
