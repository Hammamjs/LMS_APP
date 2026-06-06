import { CreateCourseParams } from './create-course.params';
import { Course } from '../../../domain/entity/course.entity';
import { Inject, Injectable } from '@nestjs/common';
import { ICOURSE_REPOSITORY } from '../../../domain/constants/injection.token';
import type { ICourseRepository } from '../../../domain/repository/course.repository.interface';
import {
  Errors,
  failure,
  IUseCase,
  Result,
  type ILoggerService,
  ILOGGER_SERVICE,
} from '@/core';
import { IUSER_REPOSITORY, type IUserRepository } from '@/module/users';
import {
  CourseMapper,
  ICourseMapperResponse,
} from '../../mapper/course-mapper';

@Injectable()
export class CreateCourseUseCase implements IUseCase<
  CreateCourseParams,
  Promise<Result<ICourseMapperResponse>>
> {
  constructor(
    @Inject(ICOURSE_REPOSITORY) private readonly courseRepo: ICourseRepository,
    @Inject(IUSER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(ILOGGER_SERVICE) private readonly logger: ILoggerService,
  ) {}
  async execute(
    params: CreateCourseParams,
  ): Promise<Result<ICourseMapperResponse>> {
    this.logger.log('Creating course', CreateCourseUseCase.name);

    const missings = this._requiredFields(params);
    if (missings.length) {
      this.logger.warn(
        `Validation failed: ${missings.join(', ')}`,
        CreateCourseUseCase.name,
      );
      return failure(Errors.validation(`Missing ${missings.join(', ')}`));
    }

    // Before create course we need to check instructor already exists
    const instructorResult = await this.userRepo.findById(params.instructorId);

    if (Result.isFail(instructorResult))
      return Result.fail(instructorResult.error);

    const createCourse = Course.create(params);

    const exisiting = await this.courseRepo.findBySlug(createCourse.slug);

    if (exisiting.ok)
      return Result.fail(
        Errors.conflict('A course with this title already exists'),
      );

    const savedCourse = await this.courseRepo.save(createCourse);

    if (Result.isFail(savedCourse)) return Result.fail(savedCourse.error);

    // Mapper to return response shape to the client
    const resoponse = CourseMapper.toResponse(savedCourse.value);

    return Result.ok(resoponse);
  }

  private _requiredFields(params: CreateCourseParams): string[] {
    const fields: (keyof CreateCourseParams)[] = [
      'instructorId',
      'title',
      'description',
      'originalPrice',
      'level',
      'category',
    ];

    return fields.filter((field) => !params[field]);
  }
}
