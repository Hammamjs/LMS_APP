import { IUseCase } from '@/core/common/domain/use-case-interface';
import { DeleteCourseParams } from './delete-course.params';
import { Result } from '@/core/common/domain/result.pattern';
import { Inject } from '@nestjs/common';
import { ICOURSE_REPOSITORY } from '../../../domain/constants/injection.token';
import type { ICourseRepository } from '../../../domain/repository/course.repository.interface';
import { Errors } from '@/core/common/domain/err.utils';

export class DeleteCourseUseCase implements IUseCase<
  DeleteCourseParams,
  Promise<Result<void>>
> {
  constructor(
    @Inject(ICOURSE_REPOSITORY) private readonly courseRepo: ICourseRepository,
  ) {}
  async execute(params: DeleteCourseParams): Promise<Result<void>> {
    // we need to get user first
    const result = await this.courseRepo.findById(params.id);

    if (!result.ok) return result;

    const course = result.value;

    // we need to check if same instructor want to delete his course
    if (course.getInstructor() !== params.currentUserId)
      return Result.fail(
        Errors.forbidden('You do not have permission to delete this course'),
      );

    const deletedVideo = course.withSoftDeletion(params.currentUserId);

    const deleted = await this.courseRepo.save(deletedVideo);

    if (!deleted.ok) return deleted;

    return Result.ok(undefined);
  }
}
