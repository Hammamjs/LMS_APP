import { IUseCase, PaginationResult, Result } from '@/core';
import { IENROLLMENT_REPOSITORY } from '@/module/enrollment/domain/constants/token.injection';
import { type IEnrollmentRepository } from '@/module/enrollment/domain/repository/enrollment.repository.interface';
import { Inject, Injectable } from '@nestjs/common';
import {
  EnrollmentMapper,
  EnrollmentResponseDto,
} from '../../mapper/enrollment.mapper';
import { ResponseBuilder } from '@/core/common/domain/response.builder';

@Injectable()
export class FindEnrollmentByUserIdUseCase implements IUseCase<
  string,
  Promise<Result<PaginationResult<EnrollmentResponseDto>>>
> {
  constructor(
    @Inject(IENROLLMENT_REPOSITORY)
    private readonly enrollmentRepo: IEnrollmentRepository,
  ) {}

  async execute(
    userId: string,
  ): Promise<Result<PaginationResult<EnrollmentResponseDto>>> {
    const enrollmentsResult = await this.enrollmentRepo.findByUser({ userId });

    if (!enrollmentsResult.ok) return enrollmentsResult;

    const { data, meta } = enrollmentsResult.value;

    const paginateResult = ResponseBuilder.paginateMapped(
      data,
      meta,
      EnrollmentMapper.toResponse,
    );

    return Result.ok(paginateResult);
  }
}
