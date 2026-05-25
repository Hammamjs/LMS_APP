import { PaginationResult } from '@/core';
import { Lesson } from '../../domain/entity/lesson.entity';

type Meta = {
  page: number;
  total: number;
  limit: number;
  lastPage: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type LessonResponseDto = {
  id: string;
  title: string;
  description: string;
  order: number;
  courseId: string;
  rating: number;
  isFree: boolean;
  url: string;
  createdAt: Date;
  updatedAt: Date;

  meta?: Meta;
};

export class LessonMapper {
  private constructor() {}

  // To map Lesson to response for client side
  public static toResponse(lesson: Lesson) {
    return {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      order: lesson.order,
      courseId: lesson.courseId,
      rating: lesson.rating,
      isFree: lesson.isFree,
      url: lesson.url,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
    };
  }

  public static toPaginationResponse(
    data: Lesson[],
    meta: Meta,
  ): PaginationResult<LessonResponseDto> {
    return {
      data: data.map((lesson) => this.toResponse(lesson)),
      meta,
    };
  }
}

export type LessonResponseType = ReturnType<typeof LessonMapper.toResponse>;
