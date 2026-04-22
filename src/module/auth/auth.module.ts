import { forwardRef, Module, Provider } from '@nestjs/common';
import { AuthController } from './presentation/auth.controller';
import { BcryptService } from './infrastructure/security/bcrypt.service';
import { TokenService } from './infrastructure/security/jwt.token.service';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../users/user.module';
import {
  EmailVerificationUseCase,
  ForgotPasswordUseCase,
  RefreshTokenUseCase,
  RegisterationUseCase,
  ResendVerificationCodeUseCase,
  VerifyResetPasswordCodeUseCase,
  AuthFacade,
  ResetPasswordUseCase,
  IBCRYPT_SERVICE,
  IEMAIL_SERVICE,
  IJWTTOKEN_SERVICE,
  ICACHE_REPOSITORY,
  SignInUseCase,
} from './index';
import { AuthSendEmail } from './application/handler/auth-email-handler';
import { NodemailerService } from './infrastructure/security/email.service';
import { RedisCacheRepository } from './infrastructure/repository/redis-cache.repository';
import { CqrsModule } from '@nestjs/cqrs';

const useCases: Provider[] = [
  AuthFacade,
  SignInUseCase,
  EmailVerificationUseCase,
  RegisterationUseCase,
  ResendVerificationCodeUseCase,
  ForgotPasswordUseCase,
  VerifyResetPasswordCodeUseCase,
  ResetPasswordUseCase,
  RefreshTokenUseCase,

  // Domain event
  AuthSendEmail,
];

const infrastructure: Provider[] = [
  BcryptService,
  TokenService,
  NodemailerService,
  RedisCacheRepository,

  {
    useExisting: BcryptService,
    provide: IBCRYPT_SERVICE,
  },
  {
    useExisting: TokenService,
    provide: IJWTTOKEN_SERVICE,
  },
  {
    useExisting: NodemailerService,
    provide: IEMAIL_SERVICE,
  },
  {
    useExisting: RedisCacheRepository,
    provide: ICACHE_REPOSITORY,
  },
];

@Module({
  controllers: [AuthController],
  providers: [...useCases, ...infrastructure],
  imports: [JwtModule.register({}), forwardRef(() => UserModule), CqrsModule],
  exports: [AuthFacade, JwtModule, IBCRYPT_SERVICE],
})
export class AuthModule {}
