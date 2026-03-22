import { Module, Provider } from '@nestjs/common';
import { PrismaUserRepository } from './infrastructure/prisma.user.repository.js';
import { UserController } from './presentation/users.controller.js';
import { FindAllUsers } from './application/findAll-users.use-case.js';

const useCases: Provider[] = [FindAllUsers];

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
