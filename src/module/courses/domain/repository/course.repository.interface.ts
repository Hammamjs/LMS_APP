import { Result } from '@core/common/result.pattern';
import { Course } from '../entity/course.entity';
import {
  PaginationParams,
  PaginationResult,
} from '@/core/common/pagination.interface';

export interface ICourseRepository {
  findAll: (
    params?: PaginationParams,
  ) => Promise<Result<PaginationResult<Course>>>;
  // This for course
  findById: (id: string) => Promise<Result<Course>>;
  save: (props: Course) => Promise<Result<Course>>;
  findBySlug: (slug: string) => Promise<Result<Course>>;

  // This for courses that belong to instructor
  findByInstructorId: (
    id: string,
    params?: PaginationParams,
  ) => Promise<Result<PaginationResult<Course>>>;

  findByCategory: (
    category: string,
    params?: PaginationParams,
  ) => Promise<Result<PaginationResult<Course>>>;

  delete: (id: string) => Promise<Result<void>>;
}
