import { Module, Provider } from '@nestjs/common';
import { UserService } from './application/users.service';
import { FindAllUsers } from './application/findAll-users.use-case';
import { PrismaUserRepository } from './infrastructure/prisma.user.repository';

const useCases: Provider[] = [FindAllUsers];

@Module({
  exports: [UserService],
  providers: [
    ...useCases,
    {
      useClass: PrismaUserRepository,
      provide: 'IUserRepository',
    },
  ],
})
export class User {}
