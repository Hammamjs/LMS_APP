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
import { ICOURSE_REPOSITORY, type ICourseRepository } from '@/module/courses';

export class FindLessonUseCase implements IUseCase<
  FindLessonParams,
  Promise<Result<LessonResponseType>>
> {
  constructor(
    @Inject(ILESSON_REPOSITORY) private readonly lessonRepo: ILessonRepository,
    @Inject(IENROLLMENT_REPOSITORY)
    private readonly enrollmentRepo: IEnrollmentRepository,
    @Inject(ICOURSE_REPOSITORY) private readonly courseRepo: ICourseRepository,
  ) {}

  async execute(params: FindLessonParams): Promise<Result<LessonResponseType>> {
    const { id, userId } = params;
    const lessonResult = await this.lessonRepo.findById(id);
    if (Result.isFail(lessonResult))
      return Result.fail<LessonResponseType>(lessonResult.error);

    const lesson = lessonResult.value;

    const courseResult = await this.courseRepo.findById(lesson.courseId);

    if (Result.isFail(courseResult))
      return Result.fail<LessonResponseType>(courseResult.error);

    const { course: courseEntity } = courseResult.value;

    const isInstructor = courseEntity.id === userId;

    const isFree = lesson.isFree;

    // this if course free
    if (isFree || isInstructor)
      return Result.ok(LessonMapper.toResponse(lessonResult.value));

    const enrollmentResult = await this.enrollmentRepo.findByCourseAndUser(
      userId,
      lesson.courseId,
    );

    if (Result.isFail(enrollmentResult))
      return Result.fail<LessonResponseType>(
        Errors.forbidden('Purchase required or access revoked.'),
      );

    const data = LessonMapper.toResponse(lessonResult.value);
    return Result.ok(data);
  }
}
