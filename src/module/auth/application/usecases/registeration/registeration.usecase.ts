import type { IUseCase } from '@/core/common/use-case-interface';
import { RegisterationRequest } from './registeration.request';
import { Result } from '@core/common/result.pattern';
import { Inject, Injectable } from '@nestjs/common';
import type { IUserRepository } from '@/module/users/domain/repositories/user.repository.interface';
import { IUSER_REPOSITORY } from '@/module/users/domain/constants/injection.token';
import type { IBcryptService } from '@/module/auth/domain/service/bcrypt.service.interface';
import {
  IBCRYPT_SERVICE,
  IOTP_REPOSITORY,
} from '@/module/auth/domain/constants/injection.token';
import { Errors, failure } from '@/core/common/err.utils';
import { User } from '@/module/users/domain/entity/user.entity';
import { UserRole } from '@/module/users/domain/interface/role.interface';
import { createHash } from 'crypto';
import type { IOTPRepository } from '@/module/auth/domain/repository/otp.repsoitory.interface';
import { EventBus } from '@nestjs/cqrs';
import { RegisterationCodeRequedEvent } from '@/module/auth/domain/events/registeration-code.requested';

@Injectable()
export class RegisterationUseCase implements IUseCase<
  RegisterationRequest,
  Promise<Result<string>>
> {
  constructor(
    @Inject(IUSER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(IBCRYPT_SERVICE) private readonly hashService: IBcryptService,
    @Inject(IOTP_REPOSITORY) private readonly otpRepo: IOTPRepository,
    private readonly eventPublisher: EventBus,
  ) {}

  async execute(dto: RegisterationRequest): Promise<Result<string>> {
    const emailResult = await this.userRepo.findByEmail(dto.email);

    if (emailResult.ok) return failure(Errors.conflict('Email already exists'));

    // we need to confirm the passwords matched
    if (dto.confirmPassword !== dto.password)
      return failure(Errors.validation('Passwords do not match'));

    // hashing user password
    const hashedPassword = await this.hashService.hash(dto.password);

    const user = User.create({
      email: dto.email,
      username: dto.username,
      password: hashedPassword,
      phone: dto.phone || null,
      role: 'Student' as UserRole,
    });

    await this.userRepo.save(user);

    // generate code from 6 digit
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    // digits encryption
    const hashedCode = createHash('sha256')
      .update(verificationCode)
      .digest('hex');

    try {
      // save the digits to redis
      await this.otpRepo.setResetCode(
        `verify:${user.getId()}`,
        hashedCode,
        600,
      );

      // Trigger event to send mail
      this.eventPublisher.publish(
        new RegisterationCodeRequedEvent(user.getEmail(), verificationCode),
      );

      return {
        ok: true,
        value: 'Please verify your account',
      };
    } catch {
      return failure(
        Errors.internal(
          'Account created, but failed to send verification email',
        ),
      );
    }
  }
}
