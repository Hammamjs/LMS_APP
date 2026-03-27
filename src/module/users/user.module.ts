import { Module, Provider } from '@nestjs/common';
import { PrismaUserRepository } from './infrastructure/prisma.user.repository.js';
import { UserController } from './presentation/users.controller.js';
import { FacadeUsers } from './application/facade.users.js';
import { CreateUserUseCase } from './application/use-case/create-user/create-user.usecase.js';
import { UpdateUserUseCase } from './application/use-case/update-user/update-user.usecase.js';
import { FindAllUsersUseCase } from './application/use-case/find-all-users/find-all-users.use-case.js';
import { FindUserUseCase } from './application/use-case/find-user/find-user.usecase.js';
import { DeleteUserUseCase } from './application/use-case/delete-user/delete-user.usecase.js';

const useCases: Provider[] = [
  FacadeUsers,
  CreateUserUseCase,
  UpdateUserUseCase,
  FindAllUsersUseCase,
  FindUserUseCase,
  DeleteUserUseCase,
];

@Module({
  providers: [
    ...useCases,
    {
      useClass: PrismaUserRepository,
      provide: 'IUserRepository',
    },
  ],
  controllers: [UserController],
  exports: [...useCases],
})
export class UserModules {}
