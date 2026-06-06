import { IUseCase, Result } from '@/core';
import { ICOURSE_REPOSITORY } from '@/module/courses/domain/constants/injection.token';
import { type ICourseRepository } from '@/module/courses/domain/repository/course.repository.interface';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class GetCoursesCategoriesUseCase implements IUseCase<
  void,
  Promise<Result<string[]>>
> {
  constructor(
    @Inject(ICOURSE_REPOSITORY) private readonly courseRepo: ICourseRepository,
  ) {}

  async execute(): Promise<Result<string[]>> {
    const categoriesResult = await this.courseRepo.findAllCategories();

    if (Result.isFail(categoriesResult))
      return Result.fail<string[]>(categoriesResult.error);

    return Result.ok(categoriesResult.value);
  }
}
