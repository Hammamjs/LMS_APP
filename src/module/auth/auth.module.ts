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
} from './domain/constants/injection.token';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../users/user.module';
import { EmailVerificationUseCase } from './application/usecases/email-verification/email-verification.usecase';
import { RegisterationUseCase } from './application/usecases/registeration/registeration.usecase';
import { NodemailerService } from './infrastructure/security/email.service';

const useCases: Provider[] = [
  AuthFacade,
  SignInUseCase,
  EmailVerificationUseCase,
  RegisterationUseCase,
];

const infrastructure: Provider[] = [
  BcryptService,
  TokenService,
  NodemailerService,

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
];

@Module({
  controllers: [AuthController],
  providers: [...useCases, ...infrastructure],
  imports: [JwtModule.register({}), UserModule],
  exports: [AuthFacade],
})
export class AuthModule {}
