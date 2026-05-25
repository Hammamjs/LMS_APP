import { UpdateCourseParams } from './update-course.params';
import { Result, IUseCase, Errors } from '@/core';
import { Inject, Injectable } from '@nestjs/common';
import { ICOURSE_REPOSITORY } from '../../../domain/constants/injection.token';
import type { ICourseRepository } from '../../../domain/repository/course.repository.interface';
import {
  CourseMapper,
  ICourseMapperResponse,
} from '../../mapper/course-mapper';

@Injectable()
export class UpdateCourseUseCase implements IUseCase<
  UpdateCourseParams,
  Promise<Result<ICourseMapperResponse>>
> {
  constructor(
    @Inject(ICOURSE_REPOSITORY) private readonly courseRepo: ICourseRepository,
  ) {}

  async execute(
    params: UpdateCourseParams,
  ): Promise<Result<ICourseMapperResponse>> {
    if (!params.id) return Result.fail(Errors.validation('Id is required'));

    const courseResult = await this.courseRepo.findById(params.id);
    if (!courseResult.ok) return courseResult;

    const { course: courseEntity, instructorData } = courseResult.value;

    // we need to check if only instructor can update his courses
    if (params.userId !== instructorData?.id)
      return Result.fail(
        Errors.forbidden('You are not allowed to update this course'),
      );

    const updatedCourse = courseEntity
      .withCourseDuration(params.duration ?? courseEntity.duration)
      .setCategory(params.category ?? courseEntity.category)
      .withDescription(params.description ?? courseEntity.description)
      .withOriginalPrice(params.originalPrice ?? courseEntity.originalPrice)
      .withDiscountPrice(params.discountPrice ?? courseEntity.discountPrice)
      .withTitle(params.title ?? courseEntity.title)
      .withLevel(params.level ?? courseEntity.level)
      .updateImage(params.image ?? courseEntity.image)
      .withLanguage(params.language ?? courseEntity.language)
      .withRequirements(
        params.requirements && params.requirements.length > 0
          ? params.requirements
          : courseEntity.requirements,
      )
      .withWhatWillLearn(
        params.whatYouLearn && params.whatYouLearn.length > 0
          ? params.whatYouLearn
          : courseEntity.whatYouWillLearn,
      )
      .withTargetAudience(
        params.targetAudience && params.targetAudience.length > 0
          ? params.targetAudience
          : courseEntity.targetAudience,
      );

    // we need to check if the new slug not exist before in our database
    // to prevent duplication
    // we check and send query only when slug already changed
    if (courseEntity.slug !== updatedCourse.slug) {
      const slugConflict = await this.courseRepo.findBySlug(updatedCourse.slug);

      if (slugConflict.ok)
        return Result.fail(
          Errors.conflict('A course with this title already exist.'),
        );
    }

    const updatedInDb = await this.courseRepo.save(updatedCourse);

    if (!updatedInDb.ok) return updatedInDb;

    const response = CourseMapper.toResponse(updatedInDb.value);

    return Result.ok(response);
  }
}
