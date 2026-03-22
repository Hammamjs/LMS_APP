import { Controller, Get } from '@nestjs/common';
import { FindAllUsers } from '../application/findAll-users.use-case';

@Controller('users')
export class UserController {
  constructor(private readonly findAll: FindAllUsers) {}

  @Get()
  async findUsers() {
    return await this.findAll.execute();
  }
}
