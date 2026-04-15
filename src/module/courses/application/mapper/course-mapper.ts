import { PaginationResult } from '@/core';
import { Course } from '../../domain/entity/course.entity';

type Meta = {
  page: number;
  total: number;
  limit: number;
  lastPage: number;
  hasNext: boolean;
  hasPrev: boolean;
};

// 1. Define the shape of a single mapped item first
export type CourseResponseDto = {
  id: string;
  title: string;
  slug: string;
  description: string;
  hours: number;
  price: number;
  category: string;
  createdAt: Date;
  instructorId: string;
  image: string | null;

  meta?: Meta;
};

export class CourseMapper {
  public static toResponse(course: Course): CourseResponseDto {
    return {
      id: course.getId(),
      title: course.getTitle(),
      slug: course.getSlug(),
      description: course.getDescription(),
      hours: course.getCourseHours(),
      price: course.getPrice(),
      category: course.getCategory(),
      createdAt: course.getCreatedAt(),
      instructorId: course.getInstructor(),
      image: course.getImage(),
    };
  }

  static toPaginationResponse(
    data: Course[],
    meta: Meta,
  ): PaginationResult<CourseResponseDto> {
    return {
      data: data.map((course) => this.toResponse(course)),
      meta,
    };
  }
}

export type ICourseMapperResponse = ReturnType<typeof CourseMapper.toResponse>;
export type ICourseMapperPaginationResult = CourseResponseDto;
