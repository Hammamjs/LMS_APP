import { Errors, IUseCase, Result } from '@/core';
import { UpdateLessonParams } from './update-lesson.params';
import {
  LessonMapper,
  LessonResponseType,
} from '../../mapper/lesson-mapper.response';
import { Inject } from '@nestjs/common';
import { ILESSON_REPOSITORY } from '@/module/lessons/domain/constants/token.injection';
import { type ILessonRepository } from '@/module/lessons/domain/repository/lesson.repository.interface';
import { IUSER_REPOSITORY, type IUserRepository } from '@/module/users';
import { ICOURSE_REPOSITORY, type ICourseRepository } from '@/module/courses';

export class UpdateLessonUseCase implements IUseCase<
  UpdateLessonParams,
  Promise<Result<LessonResponseType>>
> {
  constructor(
    @Inject(ILESSON_REPOSITORY) private readonly lessonRepo: ILessonRepository,
    @Inject(IUSER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(ICOURSE_REPOSITORY) private readonly courseRepo: ICourseRepository,
  ) {}

  async execute(
    params: UpdateLessonParams,
  ): Promise<Result<LessonResponseType>> {
    // we need to check if course exists
    const courseResult = await this.courseRepo.findById(params.courseId);

    if (!courseResult.ok) return courseResult;

    const course = courseResult.value;
    // we need to check if user exists and the permission
    const userResult = await this.userRepo.findById(params.userId);

    if (!userResult.ok) return userResult;

    const user = userResult.value;

    // check user permission
    if (!course.isOwnedBy(user.getId()) || !user.isInstructor())
      return Result.fail(Errors.forbidden('This operation is forbidden'));

    const lessonResult = await this.lessonRepo.findById(params.id);

    if (!lessonResult.ok) return lessonResult;

    const lesson = lessonResult.value;

    // we need to check if lesson bleong to course
    if (course.getId() !== lesson.getCourseId())
      return Result.fail(
        Errors.forbidden('Lesson does not belong to the specified course'),
      );

    const updatedLesson = lesson
      .withTitle(params.title ?? lesson.getTitle())
      .withDescription(params.description ?? lesson.getDescription())
      .withVideo(params.video ?? lesson.getVideo())
      .withUrl(params.sourceLink ?? lesson.getSourceLink());

    let lessonToSave = updatedLesson;

    if (typeof params.isFree != 'undefined')
      lessonToSave = params.isFree
        ? updatedLesson.markLessonAsFree()
        : updatedLesson.markLessonAsPaid();

    const saveInDb = await this.lessonRepo.save(lessonToSave);

    if (!saveInDb.ok)
      return Result.fail(Errors.internal('Failed to update course data'));

    const toResponse = LessonMapper.toResponse(saveInDb.value);

    return Result.ok(toResponse);
  }
}
