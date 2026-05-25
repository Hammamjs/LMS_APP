import { Errors, IUseCase, Result } from '@/core';
import { DeleteLessonParams } from './delete-lesson.params';
import { Inject, Injectable } from '@nestjs/common';
import { ICOURSE_REPOSITORY, type ICourseRepository } from '@/module/courses';
import { ILESSON_REPOSITORY } from '@/module/lessons/domain/constants/token.injection';
import { type ILessonRepository } from '@/module/lessons/domain/repository/lesson.repository.interface';
import { IUSER_REPOSITORY, type IUserRepository } from '@/module/users';

@Injectable()
export class DeleteLessonUseCase implements IUseCase<
  DeleteLessonParams,
  Promise<Result<undefined>>
> {
  constructor(
    @Inject(ICOURSE_REPOSITORY) private readonly courseRepo: ICourseRepository,
    @Inject(ILESSON_REPOSITORY) private readonly lessonRepo: ILessonRepository,
    @Inject(IUSER_REPOSITORY) private readonly userRepo: IUserRepository,
  ) {}

  async execute(params: DeleteLessonParams): Promise<Result<undefined>> {
    // we need to check user at first

    const userResult = await this.userRepo.findById(params.userId);
    if (!userResult.ok) return userResult;

    const lessonResult = await this.lessonRepo.findById(params.id);

    if (!lessonResult.ok) return lessonResult;

    const lesson = lessonResult.value;

    const courseResult = await this.courseRepo.findById(lesson.courseId);
    if (!courseResult.ok) return courseResult;

    const user = userResult.value;
    const { course: courseEntity } = courseResult.value;

    if (!user.isInstructor() || !courseEntity.isOwnedBy(user.id))
      return Result.fail(
        Errors.forbidden('You are not allowed to perform this action'),
      );

    // we need to check if this lesson belong to the course
    if (lesson.courseId !== courseEntity.id)
      return Result.fail(
        Errors.forbidden(
          'This lesson does not belong to the specified course.',
        ),
      );

    // mark video as deleted
    const deletedLesson = lesson.markAsDeleted();

    // soft delete
    const deletedResult = await this.lessonRepo.save(deletedLesson);

    if (!deletedResult.ok) return Result.fail(Errors.internal('Delete failed'));

    return Result.ok(undefined);
  }
}
