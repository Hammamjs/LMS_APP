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
    const result = await this.courseRepo.findById(params.id);

    if (Result.isFail(result)) {
      return Result.fail<void>(result.error);
    }

    const { course: courseEntity, instructorData } = result.value;

    if (instructorData?.id !== params.currentUserId) {
      return Result.fail<void>(
        Errors.forbidden('You do not have permission to delete this course'),
      );
    }

    const deletedVideo = courseEntity.withSoftDeletion(params.currentUserId);

    const deleted = await this.courseRepo.save(deletedVideo);

    if (Result.isFail(deleted)) {
      return Result.fail<void>(deleted.error);
    }

    console.log('delete course', deleted.value);

    return Result.ok(undefined);
  }
}
