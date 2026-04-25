import { Errors, failure } from '@/core/common/err.utils';
import { IUseCase } from '@/core/common/use-case-interface';
import {
  IBCRYPT_SERVICE,
  IJWTTOKEN_SERVICE,
} from '@/module/auth/domain/constants/injection.token';
import type { IBcryptService } from '@/module/auth/domain/service/bcrypt.service.interface';
import type { IJWTTokenService } from '@/module/auth/domain/service/token.service.interface';
import { IUSER_REPOSITORY } from '@/module/users/domain/constants/injection.token';
import { User } from '@/module/users/domain/entity/user.entity';
import type { IUserRepository } from '@/module/users/domain/repositories/user.repository.interface';
import { Result } from '@core/common/result.pattern';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ResetPasswordUseCase implements IUseCase<
  { email: string; newPassword: string; confirmPassword: string },
  Promise<Result<{ user: User; accessToken: string; refreshToken: string }>>
> {
  constructor(
    @Inject(IUSER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(IJWTTOKEN_SERVICE) private readonly tokenService: IJWTTokenService,
    @Inject(IBCRYPT_SERVICE) private readonly bcryptService: IBcryptService,
    private readonly config: ConfigService,
  ) {}

  async execute(dto: {
    email: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<
    Result<{ user: User; accessToken: string; refreshToken: string }>
  > {
    const userResult = await this.userRepo.findByEmail(dto.email);

    if (dto.newPassword.length < 6)
      return failure(Errors.validation('Password too short'));

    if (!userResult.ok) return failure(Errors.notFound('User not found'));
    const user = userResult.value;
    // check if code verified
    if (!user.getIsPasswordCodeVerified())
      return failure(Errors.validation('Reset code not verified'));

    // Check if passwords doesn't matched
    if (dto.confirmPassword !== dto.newPassword)
      return failure(Errors.validation("Passwords don't match"));

    // we need to hash user password
    const hashedPassword = await this.bcryptService.hash(dto.newPassword);

    const id = user.getId();
    const role = user.getRole();
    const email = user.getEmail();
    // we need to generate new refresh and access token
    const { accessToken, refreshToken } =
      await this.tokenService.generateAuthToken({ id, email, role });

    // we need to hash refresh token before save it  // securtiy concern
    const hashedRefreshToken = await this.bcryptService.hash(refreshToken);

    const finalUser = user
      .withPassword(hashedPassword)
      .updateRefreshToken(hashedRefreshToken)
      .resetPasswordCodeFlag();

    await this.userRepo.save(finalUser);

    return {
      ok: true,
      value: {
        user: finalUser,
        accessToken,
        refreshToken,
      },
    };
  }
}
