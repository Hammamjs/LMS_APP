import { PaginationParams } from '@/core';

export class ReviewByCourseParams implements PaginationParams {
  constructor(
    public readonly courseId: string,
    public readonly page: number = 1,
    public readonly limit: number = 15,
  ) {}
}
