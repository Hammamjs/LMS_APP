import { Result } from '@/core/common/domain/result.pattern';
import { Course } from '../entity/course.entity';
import {
  PaginationParams,
  PaginationResult,
} from '@/core/common/domain/pagination.interface';

export interface ICourseRepository {
  findAll: (
    params: PaginationParams,
  ) => Promise<Result<PaginationResult<Course>>>;
  // This for course
  findById: (id: string) => Promise<Result<Course>>;
  save: (props: Course) => Promise<Result<Course>>;
  findBySlug: (slug: string) => Promise<Result<Course>>;

  delete: (id: string) => Promise<Result<void>>;
}
