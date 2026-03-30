import { IUseCase } from '@/core/common/use-case-interface';
import { ForgorPasswordRequest } from './forgot-password.request';
import { ForgotPasswordResponse } from './forgot-password.response';
import { Result } from '@core/common/result.pattern';
import type { IUserRepository } from '@/module/users/domain/repositories/user.repository.interface';
import { Inject } from '@nestjs/common';
import { IUSER_REPOSITORY } from '@/module/users/domain/constants/injection.token';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { createHash } from 'crypto';
import { IEMAIL_SERVICE } from '@/module/auth/domain/constants/injection.token';
import type { IEmailService } from '@/module/auth/domain/service/email.service.interface';
import { Errors, failure } from '@/core/common/err.utils';

type PassResutl = Promise<Result<ForgotPasswordResponse>>;

export class ForgotPasswordUseCase implements IUseCase<
  ForgorPasswordRequest,
  PassResutl
> {
  constructor(
    @Inject(IUSER_REPOSITORY) private readonly userRep: IUserRepository,
    @InjectRedis() private readonly redis: Redis,
    @Inject(IEMAIL_SERVICE) private emailService: IEmailService,
  ) {}
  async execute(dto: ForgorPasswordRequest): PassResutl {
    const userResult = await this.userRep.findByEmail(dto.email);

    if (!userResult.ok) return userResult;

    const user = userResult.value;

    // Generate code
    const generateCode = Math.floor(100000 + Math.random() * 900000).toString();
    // Hashed code
    const hashedCode = createHash('sha256').update(generateCode).digest('hex');

    // save code in redis
    await this.redis.set(
      `reset_password:${user.getId()}`,
      hashedCode,
      'EX',
      600,
    );

    try {
      await this.emailService.send(
        user.getEmail(),
        'Reset password Code',
        `Your have request code to reset password<br /> code: ${generateCode} <br />it's only valid for 10 min`,
      );

      return {
        ok: true,
        value: { message: 'Code successfully sent to your email' },
      };
    } catch {
      return failure(Errors.validation('Code failed to sent'));
    }
  }
}
