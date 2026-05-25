import { forwardRef, Module, Provider } from '@nestjs/common';
import { PrismaUserRepository } from './infrastructure/prisma.user.repository';
import { UserController } from './presentation/users.controller';
import { FacadeUsers } from './application/facade.users';
import { CreateUserUseCase } from './application/use-case/create-user/create-user.usecase';
import { UpdateUserUseCase } from './application/use-case/update-user/update-user.usecase';
import { FindAllUsersUseCase } from './application/use-case/find-all-users/find-all-users.use-case';
import { FindUserUseCase } from './application/use-case/find-user/find-user.usecase';
import { DeleteUserUseCase } from './application/use-case/delete-user/delete-user.usecase';
import { IUSER_REPOSITORY } from './domain/constants/injection.token';
import { AuthModule } from '../auth/auth.module';
import { EmailVerifiedHandler } from './application/handler/email-verified.handler';
import { ResetPasswordHandler } from '../auth/application/handler/reset-password.handler';
import { CqrsModule } from '@nestjs/cqrs';
import { NotificationModule } from '../notification/notification.module';

const useCases: Provider[] = [
  FacadeUsers,
  CreateUserUseCase,
  UpdateUserUseCase,
  FindAllUsersUseCase,
  FindUserUseCase,
  DeleteUserUseCase,
];

const infrastructure: Provider[] = [
  PrismaUserRepository,
  {
    useClass: PrismaUserRepository,
    provide: IUSER_REPOSITORY,
  },
];

const handlers: Provider[] = [EmailVerifiedHandler, ResetPasswordHandler];

@Module({
  providers: [...useCases, ...infrastructure, ...handlers],
  controllers: [UserController],
  exports: [...useCases, IUSER_REPOSITORY],
  imports: [forwardRef(() => AuthModule), CqrsModule, NotificationModule],
})
export class UserModule {}
