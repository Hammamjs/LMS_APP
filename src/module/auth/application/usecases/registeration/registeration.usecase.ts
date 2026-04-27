import { type IUseCase, Errors, Result } from '@/core';
import { RegisterationRequest } from './registeration.request';
import { Inject, Injectable } from '@nestjs/common';
import {
  type IUserRepository,
  IUSER_REPOSITORY,
  UserRole,
} from '@/module/users';
import type { IBcryptService } from '@/module/auth/domain/service/bcrypt.service.interface';
import {
  IBCRYPT_SERVICE,
  ICACHE_REPOSITORY,
} from '@/module/auth/domain/constants/injection.token';
import { User } from '@/module/users/domain/entity/user.entity';
import { createHash } from 'crypto';
import type { ICacheRepository } from '@/module/auth/domain/repository/cache.repsoitory.interface';
import { EventBus } from '@nestjs/cqrs';
import { RegisterationCodeRequedEvent } from '@/module/auth/domain/events/registeration-code.requested';

@Injectable()
export class RegisterationUseCase implements IUseCase<
  RegisterationRequest,
  Promise<Result<{ message: string }>>
> {
  constructor(
    @Inject(IUSER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(IBCRYPT_SERVICE) private readonly hashService: IBcryptService,
    @Inject(ICACHE_REPOSITORY) private readonly cacheRepo: ICacheRepository,
    private readonly eventPublisher: EventBus,
  ) {}

  async execute(
    dto: RegisterationRequest,
  ): Promise<Result<{ message: string }>> {
    const emailResult = await this.userRepo.findByEmail(dto.email);

    if (emailResult.ok)
      return Result.fail(Errors.conflict('Email already exists'));

    // we need to confirm the passwords matched
    if (dto.confirmPassword !== dto.password)
      return Result.fail(Errors.validation('Passwords do not match'));

    // hashing user password
    const hashedPassword = await this.hashService.hash(dto.password);

    const user = User.create({
      email: dto.email,
      username: dto.username,
      password: hashedPassword,
      phone: dto.phone || null,
      role: UserRole.Student,
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
      await this.cacheRepo.set(`verify:${user.getId()}`, hashedCode, 600);

      // Trigger event to send mail
      this.eventPublisher.publish(
        new RegisterationCodeRequedEvent(user.getEmail(), verificationCode),
      );

      return Result.ok({ message: 'Please verify your account' });
    } catch {
      return Result.fail(
        Errors.internal(
          'Account created, but failed to send verification email',
        ),
      );
    }
  }
}
