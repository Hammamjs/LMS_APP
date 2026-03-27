import { Injectable } from '@nestjs/common';
import { CreateUserUseCase } from './use-case/create-user/create-user.usecase';
import { DeleteUserUseCase } from './use-case/delete-user/delete-user.usecase';
import { FindAllUsersUseCase } from './use-case/find-all-users/find-all-users.use-case';
import { FindUserUseCase } from './use-case/find-user/find-user.usecase';
import { UpdateUserUseCase } from './use-case/update-user/update-user.usecase';

@Injectable()
export class FacadeUsers {
  constructor(
    public readonly findAll: FindAllUsersUseCase,
    public readonly findOne: FindUserUseCase,
    public readonly update: UpdateUserUseCase,
    public readonly create: CreateUserUseCase,
    public readonly deleteOne: DeleteUserUseCase,
  ) {}
}
