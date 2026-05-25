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
    // 1. Fetch the pure domain Course entity
    const result = await this.courseRepo.findById(params.id);

    // 💡 Fix 1: Map the failure Result object into a matching Result<void> structure
    if (!result.ok) {
      return Result.fail(result.error);
    }

    const { course: courseEntity, instructorData } = result.value;

    // 💡 Fix 2: Look at course.instructorId directly, since findById returns a pure Course entity
    if (instructorData?.id !== params.currentUserId) {
      return Result.fail(
        Errors.forbidden('You do not have permission to delete this course'),
      );
    }

    // 💡 Fix 3: Remove the extra ".course" layer to target your aggregate root directly
    const deletedVideo = courseEntity.withSoftDeletion(params.currentUserId);

    const deleted = await this.courseRepo.save(deletedVideo);

    // 💡 Fix 4: Map this failure to matching Result<void> structure as well
    if (!deleted.ok) {
      return Result.fail(deleted.error);
    }

    return Result.ok(undefined);
  }
}
