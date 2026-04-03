import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { FacadeUsers } from '../application/facade.users';
import { CreatUserDto } from './dto/users/create-user.dto';
import { UpdateUserDto } from './dto/users/update-user.dto';
import { UserResponse } from './dto/users/user.response';
import { DomainException } from '../../../core/common/filters/domain.exception';
import { PaginationQuery } from './dto/users/pagination-params';

@Controller('users')
export class UserController {
  constructor(private readonly facadeUser: FacadeUsers) {}

  @Get('/')
  async findAll(@Query() query: PaginationQuery) {
    const result = await this.facadeUser.findAll.execute(query);

    if (!result.ok) throw new DomainException(result.error);

    const users = result.value.data.map((u) => UserResponse.from(u));
    return { data: users, meta: result.value.meta };
  }

  @Get('/:id')
  async findOne(@Param('id') id: string) {
    const result = await this.facadeUser.findOne.execute(id);
    if (!result.ok) throw new DomainException(result.error);

    const user = result.value ? UserResponse.from(result.value) : null;
    return { data: user };
  }

  @Post('create')
  async create(@Body() userdto: CreatUserDto) {
    const result = await this.facadeUser.create.execute(userdto);

    console.log(result);

    if (!result.ok) throw new DomainException(result.error);

    const user = UserResponse.from(result.value);

    return { data: user };
  }

  @Patch('update')
  async update(@Body() updateUser: UpdateUserDto) {
    const result = await this.facadeUser.update.execute(updateUser);

    if (!result.ok) throw new DomainException(result.error);

    const user = result.value ? UserResponse.from(result.value) : null;
    return { data: user };
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string) {
    const result = await this.facadeUser.deleteOne.execute(id);

    if (!result.ok) throw new DomainException(result.error);
    return;
  }
}
