import { Injectable } from '@nestjs/common';
import { FindCourseUseCase } from './usecases/find-course/find-course.usecase';
import { FindCoursesUseCase } from './usecases/find-courses/find-courses.usecase';
import { CreateCourseUseCase } from './usecases/create-course/create-course.usecase';
import { DeleteCourseUseCase } from './usecases/delete-course/delete-course.usecase';
import { UpdateCourseUseCase } from './usecases/update-course/update-course.usecase';

@Injectable()
export class CourseFacade {
  constructor(
    public readonly findCourse: FindCourseUseCase,
    public readonly findCourses: FindCoursesUseCase,
    public readonly create: CreateCourseUseCase,
    public readonly deleteCourse: DeleteCourseUseCase,
    public readonly update: UpdateCourseUseCase,
  ) {}
}
