import { PaginationResult, IUseCase, Result } from '@/core';
import { Inject, Injectable } from '@nestjs/common';
import { ICOURSE_REPOSITORY } from '../../../domain/constants/injection.token';
import type { ICourseRepository } from '../../../domain/repository/course.repository.interface';
import { FindCoursesParams } from './find-course.params';
import {
  CourseMapper,
  ICourseMapperPaginationResult,
} from '../../mapper/course-mapper';

@Injectable()
export class FindCoursesUseCase implements IUseCase<
  FindCoursesParams,
  Promise<Result<PaginationResult<ICourseMapperPaginationResult>>>
> {
  constructor(
    @Inject(ICOURSE_REPOSITORY) private readonly courseRepo: ICourseRepository,
  ) {}

  async execute(
    params: FindCoursesParams,
  ): Promise<Result<PaginationResult<ICourseMapperPaginationResult>>> {
    const results = await this.courseRepo.findAll(params);

    if (Result.isFail(results))
      return Result.fail<PaginationResult<ICourseMapperPaginationResult>>(
        results.error,
      );

    const { data, meta } = results.value;

    const mappedData = data.map(({ course, instructorData }) =>
      CourseMapper.toResponse(course, instructorData),
    );

    // Reconstruct the response pagination envelope
    const paginationData = {
      data: mappedData,
      meta,
    };

    return Result.ok(paginationData);
  }
}
