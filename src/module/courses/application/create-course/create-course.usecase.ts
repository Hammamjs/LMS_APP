import { IUseCase } from '@/core/common/domain/use-case-interface';
import { CreateCourseParams } from './create-course.params';
import { Course } from '../../domain/entity/course.entity';
import { Result } from '@/core/common/domain/result.pattern';
import { Inject, Injectable } from '@nestjs/common';
import { ICOURSE_REPOSITORY } from '../../domain/constants/injection.token';
import type { ICourseRepository } from '../../domain/repository/course.repository.interface';
import { Errors, failure } from '@/core/common/domain/err.utils';
import { IUSER_REPOSITORY } from '@/module/users/domain/constants/injection.token';
import type { IUserRepository } from '@/module/users/domain/repositories/user.repository.interface';
import {
  CourseMapper,
  ICourseMapperResponse,
} from '../../domain/entity/course-mapper';

@Injectable()
export class CreateCourseUseCase implements IUseCase<
  CreateCourseParams,
  Promise<Result<ICourseMapperResponse>>
> {
  constructor(
    @Inject(ICOURSE_REPOSITORY) private readonly courseRepo: ICourseRepository,
    @Inject(IUSER_REPOSITORY) private readonly userRepo: IUserRepository,
  ) {}
  async execute(
    params: CreateCourseParams,
  ): Promise<Result<ICourseMapperResponse>> {
    const missings = this._requiredFields(params);
    if (missings.length)
      return failure(Errors.validation(`Missing ${missings.join(', ')}`));

    // Before create course we need to check instructor already exists
    const instructorResult = await this.userRepo.findById(params.instructorId);

    if (!instructorResult.ok) return instructorResult;

    const createCourse = Course.create(params);

    const exisiting = await this.courseRepo.findBySlug(createCourse.getSlug());

    if (exisiting.ok)
      return Result.fail(
        Errors.conflict('A course with this title already exists'),
      );

    const savedCourse = await this.courseRepo.save(createCourse);

    if (!savedCourse.ok) return savedCourse;

    // Mapper to return response shape to the client
    const resoponse = CourseMapper.toResponse(savedCourse.value);

    return Result.ok(resoponse);
  }

  private _requiredFields(params: CreateCourseParams): string[] {
    const fields: (keyof CreateCourseParams)[] = [
      'instructorId',
      'title',
      'description',
      'price',
      'category',
    ];

    return fields.filter((field) => !params[field]);
  }
}
