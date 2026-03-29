import { Module, Provider } from '@nestjs/common';
import { PrismaUserRepository } from './infrastructure/prisma.user.repository';
import { UserController } from './presentation/users.controller';
import { FacadeUsers } from './application/facade.users';
import { CreateUserUseCase } from './application/use-case/create-user/create-user.usecase';
import { UpdateUserUseCase } from './application/use-case/update-user/update-user.usecase';
import { FindAllUsersUseCase } from './application/use-case/find-all-users/find-all-users.use-case';
import { FindUserUseCase } from './application/use-case/find-user/find-user.usecase';
import { DeleteUserUseCase } from './application/use-case/delete-user/delete-user.usecase';
import { IUSER_REPOSITORY } from './domain/constants/injection.token';

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
    useExisting: PrismaUserRepository,
    provide: IUSER_REPOSITORY,
  },
];

@Module({
  providers: [...useCases, ...infrastructure],
  controllers: [UserController],
  exports: [...useCases, IUSER_REPOSITORY],
})
export class UserModule {}
