import { IUseCase } from '@/core/common/domain/use-case-interface';
import { FindCourseParams } from './find-course.params';
import { Result } from '@/core/common/domain/result.pattern';
import { Inject, Injectable } from '@nestjs/common';
import { ICOURSE_REPOSITORY } from '../../../domain/constants/injection.token';
import type { ICourseRepository } from '../../../domain/repository/course.repository.interface';
import { Errors } from '@/core/common/domain/err.utils';
import {
  CourseMapper,
  ICourseMapperResponse,
} from '../../mapper/course-mapper';

@Injectable()
export class FindCourseUseCase implements IUseCase<
  FindCourseParams,
  Promise<Result<ICourseMapperResponse>>
> {
  constructor(
    @Inject(ICOURSE_REPOSITORY) private readonly courseRepo: ICourseRepository,
  ) {}

  async execute(
    params: FindCourseParams,
  ): Promise<Result<ICourseMapperResponse>> {
    if (params.id) {
      const courseResult = await this.courseRepo.findById(params.id);

      if (!courseResult.ok)
        return Result.fail(
          Errors.notFound(`Course with this id: ${params.id} not found`),
        );

      const response = CourseMapper.toResponse(courseResult.value);
      return Result.ok(response);
    }

    if (params.slug) {
      const courseResult = await this.courseRepo.findBySlug(params.slug);

      if (!courseResult.ok)
        return Result.fail(
          Errors.notFound(`Course with this title: ${params.slug} not found`),
        );

      const response = CourseMapper.toResponse(courseResult.value);

      return Result.ok(response);
    }

    return Result.fail(
      Errors.validation('Either Course Id or Slug is required'),
    );
  }
}
