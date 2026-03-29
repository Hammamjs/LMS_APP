import { Module, Provider } from '@nestjs/common';
import { AuthController } from './presentation/auth.controller';
import { AuthFacade } from './application/auth.facade';
import { SignInUseCase } from './application/usecase/sign-in/sign-in.usecase';
import { BcryptService } from './infrastructure/security/bcrypt.service';
import { TokenService } from './infrastructure/security/jwt.token.service';
import {
  IBCRYPT_SERVICE,
  IJWTTOKEN_SERVICE,
} from './domain/constants/injection.token';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../users/user.module';

const useCases: Provider[] = [AuthFacade, SignInUseCase];

const infrastructure: Provider[] = [
  BcryptService,
  TokenService,

  {
    useExisting: BcryptService,
    provide: IBCRYPT_SERVICE,
  },
  {
    useExisting: TokenService,
    provide: IJWTTOKEN_SERVICE,
  },
];

@Module({
  controllers: [AuthController],
  providers: [...useCases, ...infrastructure],
  imports: [JwtModule.register({}), UserModule],
  exports: [AuthFacade],
})
export class AuthModule {}
