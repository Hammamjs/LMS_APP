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
import { PaginationQuery } from './dto/users/pagination-params';

@Controller('users')
export class UserController {
  constructor(private readonly facadeUser: FacadeUsers) {}

  @Get()
  async findAll(@Query() query: PaginationQuery) {
    return await this.facadeUser.findAll.execute(query);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.facadeUser.findById.execute(id);
  }

  @Post('create')
  async create(@Body() userdto: CreatUserDto) {
    return await this.facadeUser.create.execute(userdto);
  }

  @Patch('update')
  async update(@Body() updateUser: UpdateUserDto) {
    return await this.facadeUser.update.execute(updateUser);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string) {
    return await this.facadeUser.deleteOne.execute(id);
  }
}
