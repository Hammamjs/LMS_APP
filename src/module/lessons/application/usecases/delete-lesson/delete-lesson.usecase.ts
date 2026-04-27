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

    const [courseResult, lessonResult, userResult] = await Promise.all([
      this.courseRepo.findById(params.courseId),
      this.lessonRepo.findById(params.id),
      this.userRepo.findById(params.userId),
    ]);

    if (!userResult.ok) return userResult;
    if (!courseResult.ok) return courseResult;
    if (!lessonResult.ok) return lessonResult;

    const user = userResult.value;
    const course = courseResult.value;
    const lesson = lessonResult.value;

    if (!user.isInstructor() || !course.isOwnedBy(user.getId()))
      return Result.fail(
        Errors.forbidden('You are not allowed to perform this action'),
      );

    // we need to check if this lesson belong to the course
    if (lesson.getCourseId() !== course.getId())
      return Result.fail(
        Errors.forbidden(
          'This lesson does not belong to the specified course.',
        ),
      );

    // mark video as deleted
    const deletedLesson = lesson.markAsDeleted();

    // Hard delete
    const deletedResult = await this.lessonRepo.save(deletedLesson);

    if (!deletedResult.ok) return Result.fail(Errors.internal('Delete failed'));

    return Result.ok(undefined);
  }
}
