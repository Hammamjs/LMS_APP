import { IUseCase } from '@/core/common/domain/use-case-interface';
import { UpdateCourseParams } from './update-course.params';
import { Result } from '@/core/common/domain/result.pattern';
import { Inject, Injectable } from '@nestjs/common';
import { IUSER_REPOSITORY } from '@/module/users/domain/constants/injection.token';
import type { IUserRepository } from '@/module/users/domain/repositories/user.repository.interface';
import { ICOURSE_REPOSITORY } from '../../domain/constants/injection.token';
import type { ICourseRepository } from '../../domain/repository/course.repository.interface';
import { Errors } from '@/core/common/domain/err.utils';
import {
  CourseMapper,
  ICourseMapperResponse,
} from '../../domain/entity/course-mapper';

@Injectable()
export class UpdateCourseUseCase implements IUseCase<
  UpdateCourseParams,
  Promise<Result<ICourseMapperResponse>>
> {
  constructor(
    @Inject(IUSER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(ICOURSE_REPOSITORY) private readonly courseRepo: ICourseRepository,
  ) {}

  async execute(
    params: UpdateCourseParams,
  ): Promise<Result<ICourseMapperResponse>> {
    if (!params.id) return Result.fail(Errors.validation('Id is required'));

    const courseResult = await this.courseRepo.findById(params.id);
    if (!courseResult.ok) return courseResult;

    const course = courseResult.value;

    // we need to check if only instructor can update his courses
    if (params.userId !== course.getInstructor())
      return Result.fail(
        Errors.forbidden('You are not allowed to update this course'),
      );

    const updatedCourse = course
      .withCourseHours(params.hours ?? course.getCourseHours())
      .setCategory(params.category ?? course.getCategory())
      .withDescription(params.description ?? course.getDescription())
      .withPrice(params.price ?? course.getPrice())
      .withTitle(params.title ?? course.getTitle())
      .updateImage(params.image ?? course.getImage());

    // we need to check if the new slug not exist before in our database
    // to prevent duplication
    // we check and send query only when slug already changed
    if (course.getSlug() !== updatedCourse.getSlug()) {
      const slugConflict = await this.courseRepo.findBySlug(
        updatedCourse.getSlug(),
      );

      if (slugConflict.ok)
        return Result.fail(
          Errors.conflict('A course with this title already exist.'),
        );
    }

    const updatedInDb = await this.courseRepo.save(updatedCourse);

    if (!updatedInDb.ok) return updatedInDb;

    const response = CourseMapper.toResponse(updatedInDb.value);

    return Result.ok(response);
  }
}
