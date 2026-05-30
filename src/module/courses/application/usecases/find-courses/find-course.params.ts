import { PaginationParams } from '@/core';
import { Level } from '@/module/courses/domain/types/course.types';

export interface FindCoursesParams extends PaginationParams {
  search?: string;
  category?: string;
  instructorId?: string;
  level?: Level;
}
