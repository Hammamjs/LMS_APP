import { Result } from '@/core/common/domain/result.pattern';
import { Course } from '../entity/course.entity';
import {
  PaginationParams,
  PaginationResult,
} from '@/core/common/domain/pagination.interface';
import { CourseWithInstructorData } from '../../infrastructure/mapper/course.mapper';

export interface ICourseRepository {
  findAll: (
    params: PaginationParams,
  ) => Promise<Result<PaginationResult<CourseWithInstructorData>>>;
  // This for course

  // for aggergation
  recalculateReviewMetrics: (courseId: string) => Promise<void>;

  findById: (id: string) => Promise<Result<CourseWithInstructorData>>;
  save: (props: Course) => Promise<Result<Course>>;
  findBySlug: (slug: string) => Promise<Result<CourseWithInstructorData>>;

  findAllCategories: () => Promise<Result<string[]>>;

  delete: (id: string) => Promise<Result<void>>;
}
