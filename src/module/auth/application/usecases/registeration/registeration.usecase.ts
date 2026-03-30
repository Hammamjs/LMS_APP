import { IUseCase } from '@/core/common/use-case-interface';
import { RegisterationRequest } from './registeration.request';
import { Result } from '@core/common/result.pattern';
import { Inject, Injectable } from '@nestjs/common';
import type { IUserRepository } from '@/module/users/domain/repositories/user.repository.interface';
import { IUSER_REPOSITORY } from '@/module/users/domain/constants/injection.token';
import type { IBcryptService } from '@/module/auth/domain/service/bcrypt.service.interface';
import {
  IBCRYPT_SERVICE,
  IEMAIL_SERVICE,
} from '@/module/auth/domain/constants/injection.token';
import { Errors, failure } from '@/core/common/err.utils';
import { User } from '@/module/users/domain/entity/user.entity';
import { UserRole } from '@/module/users/domain/interface/role.interface';
import { createHash } from 'crypto';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { IEmailService } from '@/module/auth/domain/service/email.service.interface';

@Injectable()
export class RegisterationUseCase implements IUseCase<
  RegisterationRequest,
  Promise<Result<string>>
> {
  constructor(
    @Inject(IUSER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(IBCRYPT_SERVICE) private readonly hash: IBcryptService,
    @InjectRedis() private readonly redis: Redis,
    @Inject(IEMAIL_SERVICE) private readonly email: IEmailService,
  ) {}

  async execute(dto: RegisterationRequest): Promise<Result<string>> {
    const emailResult = await this.userRepo.findByEmail(dto.email);

    if (emailResult.ok) return failure(Errors.conflict('Email already exists'));

    // hashing user password
    const hashedPassword = await this.hash.hash(dto.password);

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
      await this.redis.set(`verify:${user.getId()}`, hashedCode, 'EX', 600);
      await this.email.send(
        user.getEmail(),
        'Your verification code',
        `Your verification Code is <br /> <b>${verificationCode}</b> <br /> Valid for 10 mins`,
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
