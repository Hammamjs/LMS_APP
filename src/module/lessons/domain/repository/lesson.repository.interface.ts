import { PaginationResult, Result } from '@/core';
import { Lesson } from '../entity/lesson.entity';
import { LessonPaginationParams } from '../lesson.type';

export interface ILessonRepository {
  findAll: (
    params: LessonPaginationParams,
  ) => Promise<Result<PaginationResult<Lesson>>>;
  findById: (id: string) => Promise<Result<Lesson>>;
  save: (prop: Lesson) => Promise<Result<Lesson>>;
  delete: (id: string) => Promise<Result<void>>;
  findLastOrderByCourse: (courseId: string) => Promise<Result<number>>;
}
