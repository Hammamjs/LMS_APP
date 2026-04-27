import { Errors, IUseCase, Result } from '@/core';
import {
  EnrollmentMapper,
  EnrollmentResponseDto,
} from '../../mapper/enrollment.mapper';
import { Inject } from '@nestjs/common';
import { IENROLLMENT_REPOSITORY } from '@/module/enrollment/domain/constants/token.injection';
import { type IEnrollmentRepository } from '@/module/enrollment/domain/repository/enrollment.repository.interface';
import { FindEnrollmentParams } from './find-enrollment.params';

export class FindEnrollmentByCourseAndUserUseCase implements IUseCase<
  FindEnrollmentParams,
  Promise<Result<EnrollmentResponseDto>>
> {
  constructor(
    @Inject(IENROLLMENT_REPOSITORY)
    private readonly enrollmentRepo: IEnrollmentRepository,
  ) {}

  async execute(
    params: FindEnrollmentParams,
  ): Promise<Result<EnrollmentResponseDto>> {
    const enrollmentResult = await this.enrollmentRepo.findByCourseAndUser(
      params.userId,
      params.courseId,
    );

    if (!enrollmentResult.ok)
      return Result.fail(Errors.notFound('User has no enrollment'));

    const enrollmentResponse = EnrollmentMapper.toResponse(
      enrollmentResult.value,
    );

    return Result.ok(enrollmentResponse);
  }
}
