import { Module, Provider } from '@nestjs/common';
import { AuthController } from './presentation/auth.controller';
import { AuthFacade } from './application/auth.facade';
import { SignInUseCase } from './application/usecases/sign-in/sign-in.usecase';
import { BcryptService } from './infrastructure/security/bcrypt.service';
import { TokenService } from './infrastructure/security/jwt.token.service';
import {
  IBCRYPT_SERVICE,
  IEMAIL_SERVICE,
  IJWTTOKEN_SERVICE,
  IOTP_REPOSITORY,
} from './domain/constants/injection.token';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../users/user.module';
import { EmailVerificationUseCase } from './application/usecases/email-verification/email-verification.usecase';
import { RegisterationUseCase } from './application/usecases/registeration/registeration.usecase';
import { NodemailerService } from './infrastructure/security/email.service';
import { RedisOTPRepository } from './infrastructure/repository/redis-otp.repository';
import { ResendVerificationCodeUseCase } from './application/usecases/resend-verification-code/resend-verification-code.usecase';
import { ForgotPasswordUseCase } from './application/usecases/forgot-password/forgot-password.usecase';
import { VerifyResetPasswordCodeUseCase } from './application/usecases/verify-reset-password-code/verify-reset-password-code.usecase';
import { ResetPasswordUseCase } from './application/usecases/reset-password/reset-password.usecase';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthSendEmail } from './application/usecases/event-handler/auth-email-handler';
import { RefreshTokenUseCase } from './application/usecases/refresh-token/refresh-token.usecase';

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
  RedisOTPRepository,

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
    useExisting: RedisOTPRepository,
    provide: IOTP_REPOSITORY,
  },
];

@Module({
  controllers: [AuthController],
  providers: [...useCases, ...infrastructure],
  imports: [JwtModule.register({}), UserModule, CqrsModule],
  exports: [AuthFacade],
})
export class AuthModule {}
