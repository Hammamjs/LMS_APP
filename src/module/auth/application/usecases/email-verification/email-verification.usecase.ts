import { IUseCase } from '@/core/common/domain/use-case-interface';
import { Result } from '@/core/common/domain/result.pattern';
import type { IUserRepository } from '@/module/users/domain/repositories/user.repository.interface';
import { Inject, Injectable } from '@nestjs/common';
import { IUSER_REPOSITORY } from '@/module/users/domain/constants/injection.token';
import {
  IJWTTOKEN_SERVICE,
  ICACHE_REPOSITORY,
} from '@/module/auth/domain/constants/injection.token';
import type { IJWTTokenService } from '@/module/auth/domain/service/token.service.interface';
import { EmailVerificationRequest } from './email-verification.request';
import { EmailVerificationResponse } from './email-verification.response';
import { Errors } from '@/core/common/domain/err.utils';
import { createHash } from 'crypto';
import { ConfigService } from '@nestjs/config';
import type { ICacheRepository } from '@/module/auth/domain/repository/cache.repsoitory.interface';

@Injectable()
export class EmailVerificationUseCase implements IUseCase<
  EmailVerificationRequest,
  Promise<Result<EmailVerificationResponse>>
> {
  constructor(
    @Inject(IUSER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(IJWTTOKEN_SERVICE) private readonly tokenService: IJWTTokenService,
    @Inject(ICACHE_REPOSITORY) private readonly cacheRepo: ICacheRepository,
    private readonly config: ConfigService,
  ) {}

  async execute(
    dto: EmailVerificationRequest,
  ): Promise<Result<EmailVerificationResponse>> {
    const userResult = await this.userRepo.findByEmail(dto.email);

    if (!userResult.ok) return userResult;

    const user = userResult.value;

    if (user.getIsVerified())
      return Result.fail(Errors.validation('Email already verified'));

    const inputHash = createHash('sha256').update(dto.code).digest('hex');

    const savedCodeResult = await this.cacheRepo.get(`verify:${user.getId()}`);

    if (!savedCodeResult.ok)
      return Result.fail(Errors.internal('Failed to retrive code'));

    if (!savedCodeResult.value)
      return Result.fail(
        Errors.internal('Verification code has expired or was never sent'),
      );

    if (inputHash !== savedCodeResult.value)
      return Result.fail(Errors.validation('Incorrect verification code'));

    const id = user.getId(),
      email = user.getEmail(),
      role = user.getRole();

    const accessToken = await this.tokenService.generate(
      { id, email, role },
      {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET'),
        expiresIn: '15min',
      },
    );

    const refreshToken = await this.tokenService.generate(
      { id, email, role },
      {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn: '7d',
      },
    );

    const finalUser = user.verify().updateRefreshToken(refreshToken);

    // atomic clean up and save
    await Promise.all([
      this.cacheRepo.del(`verify:${user.getId()}`),
      this.userRepo.save(finalUser),
    ]);

    return Result.ok({ user: finalUser, accessToken, refreshToken });
  }
}
