import { Body, Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { EnrollmentFacade } from '../application/enrollment.facade';
import { EnrollmentDto } from './dto/enrollment.dto';
import { RoleGuard, VerifyJwt, Roles } from '@/core';
import { UserRole } from '@/module/users';
import { JwtPayload } from '@/module/auth';

@UseGuards(VerifyJwt, RoleGuard)
@Controller('enrollment')
export class EnrollmentController {
  constructor(private readonly enrollmentFacade: EnrollmentFacade) {}
  @Roles(UserRole.Instructor, UserRole.Admin, UserRole.Student)
  // this route only allowed Admin and Instructor
  @Get()
  async FindEnrollmentByCourseAndUser(@Query() dto: EnrollmentDto) {
    console.log('Find enrollment ');
    return await this.enrollmentFacade.findEnrollmentByCourseAndUser.execute(
      dto,
    );
  }

  @Roles(UserRole.Student)
  @Get('user')
  async FindEnrollmentsByUser(@Req() request: Request) {
    const { id } = request['user'] as JwtPayload;

    return await this.enrollmentFacade.findEnrollmentByUser.execute(id);
  }
}
