import { Errors, IUseCase, Result } from '@/core';
import {
  LessonMapper,
  LessonResponseType,
} from '../../mapper/lesson-mapper.response';
import { Inject } from '@nestjs/common';
import { ILESSON_REPOSITORY } from '@/module/lessons/domain/constants/token.injection';
import type { ILessonRepository } from '@/module/lessons/domain/repository/lesson.repository.interface';
import {
  type IEnrollmentRepository,
  IENROLLMENT_REPOSITORY,
} from '@/module/enrollment';
import { FindLessonParams } from './find-lesson.params';

export class FindLessonUseCase implements IUseCase<
  FindLessonParams,
  Promise<Result<LessonResponseType>>
> {
  constructor(
    @Inject(ILESSON_REPOSITORY) private readonly lessonRepo: ILessonRepository,
    @Inject(IENROLLMENT_REPOSITORY)
    private readonly enrollmentRepo: IEnrollmentRepository,
  ) {}

  async execute(params: FindLessonParams): Promise<Result<LessonResponseType>> {
    const { id, userId } = params;
    const lessonResult = await this.lessonRepo.findById(id);
    if (!lessonResult.ok) return lessonResult;

    const lesson = lessonResult.value;

    // this if course free
    if (lesson.getIsFree())
      return Result.ok(LessonMapper.toResponse(lessonResult.value));

    const enrollmentResult = await this.enrollmentRepo.findByCourseAndUser(
      userId,
      lesson.getCourseId(),
    );

    if (!enrollmentResult.ok || !enrollmentResult.value.isActive())
      return Result.fail(
        Errors.forbidden('Purchase required or access revoked.'),
      );

    const data = LessonMapper.toResponse(lessonResult.value);
    return Result.ok(data);
  }
}
