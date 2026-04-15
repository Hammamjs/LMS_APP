import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LessonFacade } from '../application/lessons.facade';
import { CreateLessonParams } from './dto/create-lesson.dto';
import { RoleGuard, VerifyJwt } from '@/core';
import { Roles } from '@/core/common/infrastructure/decorators/roles.decorator';
import { UserRole } from '@/module/users';
import { JwtPayload } from '@/module/auth';

@UseGuards(VerifyJwt, RoleGuard)
@Roles(UserRole.Instructor)
@Controller('lessons')
export class LessonController {
  constructor(private readonly lesson: LessonFacade) {}

  @Get()
  async findAll(@Query('courseId') courseId: string) {
    return await this.lesson.findAll.execute({ courseId });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.lesson.findOne.execute(id);
  }

  @Post()
  async create(@Body() dto: CreateLessonParams, @Req() req: Request) {
    const { id: userId } = req['user'] as JwtPayload;

    return this.lesson.create.execute({ ...dto, userId });
  }
}
