import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LessonFacade } from '../application/lessons.facade';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { RoleGuard, VerifyJwt } from '@/core';
import { Roles } from '@/core/common/infrastructure/decorators/roles.decorator';
import { UserRole } from '@/module/users';
import { JwtPayload } from '@/module/auth';
import { UpdateLessonDto } from './dto/update.lesson.dto';

@UseGuards(VerifyJwt, RoleGuard)
@Controller('lessons')
export class LessonController {
  constructor(private readonly lesson: LessonFacade) {}

  @Get()
  async findAll(@Query('courseId') courseId: string) {
    console.log('Lessons route hitted');
    return await this.lesson.findAll.execute({ courseId });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const { id: userId } = req['user'] as JwtPayload;
    return await this.lesson.findOne.execute({ id, userId });
  }

  @Roles(UserRole.Instructor)
  @Post()
  async create(@Body() dto: CreateLessonDto, @Req() req: Request) {
    const { id: userId } = req['user'] as JwtPayload;

    return this.lesson.create.execute({ ...dto, userId });
  }

  @Roles(UserRole.Instructor)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateLessonDto,
    @Req() req: Request,
  ) {
    const { id: userId } = req['user'] as JwtPayload;
    return await this.lesson.update.execute({ userId, id, ...dto });
  }

  @Roles(UserRole.Instructor)
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: Request) {
    const { id: userId } = req['user'] as JwtPayload;
    return await this.lesson.deleteOne.execute({ userId, id });
  }
}
