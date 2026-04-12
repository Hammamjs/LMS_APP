import { PaginationResult } from '@/core/common/domain/pagination.interface';
import { IUseCase } from '@/core/common/domain/use-case-interface';
import { Inject, Injectable } from '@nestjs/common';
import { ICOURSE_REPOSITORY } from '../../domain/constants/injection.token';
import type { ICourseRepository } from '../../domain/repository/course.repository.interface';
import { FindCoursesParams } from './find-course.params';
import { Result } from '@/core/common/domain/result.pattern';
import {
  CourseMapper,
  ICourseMapperPaginationResult,
} from '../../domain/entity/course-mapper';

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

    if (!results.ok) return Result.fail(results.error);

    const { data, meta } = results.value;

    const paginationData = CourseMapper.toPaginationResponse(data, meta);

    return Result.ok(paginationData);
  }
}
