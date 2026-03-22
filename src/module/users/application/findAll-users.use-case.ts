import { IUseCase } from 'src/core/common/use-case-interface';
import type { IUserRepository } from '../domain/user.repository';
import { User } from '../user.module';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindAllUsers implements IUseCase<void, Promise<User[]>> {
  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
  ) {}
  async execute() {
    return await this.userRepo.findAll();
  }
}
