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
  sourceLink: string | null;
  video: string | null;
  createdAt: Date;
  updatedAt: Date;

  meta?: Meta;
};

export class LessonMapper {
  private constructor() {}

  // To map Lesson to response for client side
  public static toResponse(lesson: Lesson) {
    return {
      id: lesson.getId(),
      title: lesson.getTitle(),
      description: lesson.getDescription(),
      order: lesson.getOrder(),
      courseId: lesson.getCourseId(),
      rating: lesson.getRating(),
      isFree: lesson.getIsFree(),
      sourceLink: lesson.getSourceLink(),
      video: lesson.getVideo(),
      createdAt: lesson.getCreatedAt(),
      updatedAt: lesson.getUpdatedAt(),
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
