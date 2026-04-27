import { Injectable } from '@nestjs/common';
import { FindEnrollmentByCourseAndUserUseCase } from './usecases/find-enrollment-by-course_user/find-enrollment-by-course_user.usecase';
import { FindEnrollmentByUserIdUseCase } from './usecases/find-enrollment-by-user-id/find-enrollment-by-user.usecase';

@Injectable()
export class EnrollmentFacade {
  constructor(
    public readonly findEnrollmentByCourseAndUser: FindEnrollmentByCourseAndUserUseCase,
    public readonly findEnrollmentByUser: FindEnrollmentByUserIdUseCase,
  ) {}
}
