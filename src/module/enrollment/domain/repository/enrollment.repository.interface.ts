import { PaginationResult, Result } from '@/core';
import { Enrollment } from '../entity/enrollment.entity';
import { EnrollmentPaginationResult } from '../entity/enrollment.types';

export interface IEnrollmentRepository {
  findAllByCourseId: (courseId: string) => Promise<Result<Enrollment[]>>;
  findById: (id: string) => Promise<Result<Enrollment>>;
  save: (enrollment: Enrollment) => Promise<Result<Enrollment>>;

  findByCourseAndUser: (
    userId: string,
    courseId: string,
  ) => Promise<Result<Enrollment>>;

  findByUser: (
    parms: EnrollmentPaginationResult,
  ) => Promise<Result<PaginationResult<Enrollment>>>;
}
