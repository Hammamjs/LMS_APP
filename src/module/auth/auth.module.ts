import { Module, Provider } from '@nestjs/common';
import { AuthController } from './presentation/auth.controller';
import { AuthFacade } from './application/auth.facade';
import { SignInUseCase } from './application/usecase/sign-in/sign-in.usecase';
import { BcryptService } from './infrastructure/security/bcrypt.service';
import { TokenService } from './infrastructure/security/jwt.token.service';
import { PrismaUserRepository } from '../users/infrastructure/prisma.user.repository';
import {
  IBCRYPT_SERVICE,
  IJWTTOKEN_SERVICE,
  IUSER_REPOSITORY,
} from './domain/service/token.symbol';

const useCases: Provider[] = [AuthFacade, SignInUseCase];

@Module({
  controllers: [AuthController],
  providers: [
    ...useCases,
    {
      useClass: BcryptService,
      provide: IBCRYPT_SERVICE,
    },
    {
      useClass: TokenService,
      provide: IJWTTOKEN_SERVICE,
    },
    {
      useClass: PrismaUserRepository,
      provide: IUSER_REPOSITORY,
    },
  ],
  imports: [],
  exports: [...useCases, IJWTTOKEN_SERVICE, IUSER_REPOSITORY, IBCRYPT_SERVICE],
})
export class AuthModule {}
