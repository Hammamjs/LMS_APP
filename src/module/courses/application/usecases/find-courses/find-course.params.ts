import { PaginationParams } from '@/core/common/domain/pagination.interface';

export interface FindCoursesParams extends PaginationParams {
  search?: string;
  category?: string;
  instructorId?: string;
}
