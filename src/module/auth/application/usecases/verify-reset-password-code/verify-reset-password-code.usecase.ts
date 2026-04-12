import { IUseCase } from '@/core/common/domain/use-case-interface';
import { VerifyResetPasswordCodeParam } from './verify-reset-password-code.params';
import { Result } from '@/core/common/domain/result.pattern';
import { Inject, Injectable } from '@nestjs/common';
import { IUSER_REPOSITORY } from '@/module/users/domain/constants/injection.token';
import type { IUserRepository } from '@/module/users/domain/repositories/user.repository.interface';
import { IOTP_REPOSITORY } from '@/module/auth/domain/constants/injection.token';
import type { IOTPRepository } from '@/module/auth/domain/repository/otp.repsoitory.interface';
import { Errors, failure } from '@/core/common/domain/err.utils';
import { createHash } from 'crypto';
type VRPCParams = VerifyResetPasswordCodeParam;

@Injectable()
export class VerifyResetPasswordCodeUseCase implements IUseCase<
  VRPCParams,
  Promise<Result<string>>
> {
  constructor(
    @Inject(IUSER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(IOTP_REPOSITORY) private readonly otpRepo: IOTPRepository,
  ) {}

  async execute(dto: VRPCParams): Promise<Result<string>> {
    const userResult = await this.userRepo.findByEmail(dto.email);

    if (!userResult.ok)
      return failure(Errors.notFound('User with this email not found'));

    const user = userResult.value;
    // hashing code
    const hashingCode = createHash('sha256').update(dto.code).digest('hex');

    // get hashed code from redis
    const savedCodeResult = await this.otpRepo.getResetCode(
      `reset_password:${user.getId()}`,
    );

    if (!savedCodeResult.ok)
      return failure(Errors.internal('Failed to retrive code'));

    if (!savedCodeResult.value)
      return failure(
        Errors.internal('Verification code has expired or was never sent'),
      );

    if (hashingCode !== savedCodeResult.value)
      return failure(Errors.validation('Invalid code or was never sent'));

    // set code is verified
    const verifyUser = user.markPasswordCodeVerified();

    // we need to save this to db and delete saved code

    try {
      await Promise.all([
        this.userRepo.save(verifyUser),
        this.otpRepo.delResetCode(`reset_password:${verifyUser.getId()}`),
      ]);

      return {
        ok: true,
        value: 'Code verification done successfully',
      };
    } catch {
      return failure(Errors.internal('Failed to save process'));
    }
  }
}
