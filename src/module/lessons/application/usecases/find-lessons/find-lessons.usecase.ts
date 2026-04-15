import { Errors, IUseCase, PaginationResult, Result } from '@/core';
import { Inject, Injectable } from '@nestjs/common';
import { ILESSON_REPOSITORY } from '../../../domain/constants/token.injection';
import type { ILessonRepository } from '../../../domain/repository/lesson.repository.interface';
import { ICOURSE_REPOSITORY, type ICourseRepository } from '@/module/courses';
import { FindLessonsParams } from './find-lessons.params';
import {
  LessonMapper,
  LessonResponseDto,
} from '../../mapper/lesson-mapper.response';

@Injectable()
export class FindLessonsUseCase implements IUseCase<
  FindLessonsParams,
  Promise<Result<PaginationResult<LessonResponseDto>>>
> {
  constructor(
    @Inject(ILESSON_REPOSITORY) private readonly lessonRepo: ILessonRepository,
    @Inject(ICOURSE_REPOSITORY) private readonly courseRepo: ICourseRepository,
  ) {}

  async execute(
    params: FindLessonsParams,
  ): Promise<Result<PaginationResult<LessonResponseDto>>> {
    // we need to ensure the course exists before go further
    const courseResult = await this.courseRepo.findById(params.courseId);

    if (!courseResult.ok) return courseResult;

    const lessonsResult = await this.lessonRepo.findAll(params);

    if (!lessonsResult.ok)
      return Result.fail(Errors.notFound('No lessons could be found'));

    const { data, meta } = lessonsResult.value;

    const paginationData = LessonMapper.toPaginationResponse(data, meta);

    return Result.ok(paginationData);
  }
}
