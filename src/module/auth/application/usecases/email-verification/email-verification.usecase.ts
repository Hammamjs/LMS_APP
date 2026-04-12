import { IUseCase } from '@/core/common/domain/use-case-interface';
import { Result } from '@/core/common/domain/result.pattern';
import type { IUserRepository } from '@/module/users/domain/repositories/user.repository.interface';
import { Inject, Injectable } from '@nestjs/common';
import { IUSER_REPOSITORY } from '@/module/users/domain/constants/injection.token';
import {
  IJWTTOKEN_SERVICE,
  IOTP_REPOSITORY,
} from '@/module/auth/domain/constants/injection.token';
import type { IJWTTokenService } from '@/module/auth/domain/service/token.service.interface';
import { EmailVerificationRequest } from './email-verification.request';
import { EmailVerificationResponse } from './email-verification.response';
import { Errors, failure } from '@/core/common/domain/err.utils';
import { createHash } from 'crypto';
import { ConfigService } from '@nestjs/config';
import type { IOTPRepository } from '@/module/auth/domain/repository/otp.repsoitory.interface';

@Injectable()
export class EmailVerificationUseCase implements IUseCase<
  EmailVerificationRequest,
  Promise<Result<EmailVerificationResponse>>
> {
  constructor(
    @Inject(IUSER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(IJWTTOKEN_SERVICE) private readonly tokenService: IJWTTokenService,
    @Inject(IOTP_REPOSITORY) private readonly otpRepo: IOTPRepository,
    private readonly config: ConfigService,
  ) {}

  async execute(
    dto: EmailVerificationRequest,
  ): Promise<Result<EmailVerificationResponse>> {
    const userResult = await this.userRepo.findByEmail(dto.email);

    if (!userResult.ok) return userResult;

    const user = userResult.value;

    if (user.getIsVerified())
      return failure(Errors.validation('Email already verified'));

    const inputHash = createHash('sha256').update(dto.code).digest('hex');

    const savedCodeResult = await this.otpRepo.getResetCode(
      `verify:${user.getId()}`,
    );

    if (!savedCodeResult.ok)
      return failure(Errors.internal('Failed to retrive code'));

    if (!savedCodeResult.value)
      return failure(
        Errors.internal('Verification code has expired or was never sent'),
      );

    if (inputHash !== savedCodeResult.value)
      return failure(Errors.validation('Incorrect verification code'));

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
      this.otpRepo.delResetCode(`verify:${user.getId()}`),
      this.userRepo.save(finalUser),
    ]);

    return {
      ok: true,
      value: { user: finalUser, accessToken, refreshToken },
    };
  }
}
