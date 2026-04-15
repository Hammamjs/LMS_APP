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
  Req,
  UseGuards,
} from '@nestjs/common';
import { CourseFacade } from '../application/course.facade';
import { FindCoursesDto } from './dto/find-courses.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { isUUID } from 'class-validator';
import { FindCourseParams } from '../application/usecases/find-course/find-course.params';
import { RoleGuard, VerifyJwt } from '@/core';
import { JwtPayload } from '@/module/auth';
import { UserRole } from '@/module/users';
import { Roles } from '@/core/common/infrastructure/decorators/roles.decorator';

@Controller('courses')
export class CourseController {
  constructor(private readonly course: CourseFacade) {}
  @Get()
  async findAll(@Query() dto: FindCoursesDto) {
    console.log(dto.search);
    return await this.course.findCourses.execute(dto);
  }

  @Get(':identifier')
  async findOne(@Param('identifier') identifier: string) {
    const isId = isUUID(identifier);
    const params: FindCourseParams = {
      id: isId ? identifier : undefined,
      slug: !isId ? identifier : undefined,
    };

    return await this.course.findCourse.execute(params);
  }

  @UseGuards(VerifyJwt, RoleGuard)
  @Roles(UserRole.Instructor)
  @Post()
  async create(@Body() dto: CreateCourseDto, @Req() req: Request) {
    const instructor = req['user'] as JwtPayload;
    const instructorId = instructor.id;
    return await this.course.create.execute({ instructorId, ...dto });
  }

  @UseGuards(VerifyJwt)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
    @Req() req: Request,
  ) {
    const user = req['user'] as JwtPayload;
    return await this.course.update.execute({ id, userId: user.id, ...dto });
  }

  @UseGuards(VerifyJwt)
  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string, @Req() req: Request) {
    const user = req['user'] as JwtPayload;
    const currentUserId = user.id;

    return await this.course.deleteCourse.execute({
      id,
      currentUserId,
    });
  }
}
