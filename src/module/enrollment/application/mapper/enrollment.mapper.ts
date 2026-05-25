import { CourseMapper } from '@/module/courses/application/mapper/course-mapper';
import { Enrollment } from '../../domain/entity/enrollment.entity';
import { Status } from '../../domain/entity/enrollment.types';

type Meta = {
  page: number;
  total: number;
  limit: number;
  lastPage: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type EnrollmentResponseDto = {
  id: string | null;
  userId: string | null;
  courseId: string | null;

  status: Status | null;

  enrolledAt: Date | null;
  createdAt: Date | null;

  progressPercentage: number;

  completedLessons: string[];

  course: {
    id: string;
    image: string | null;
    title: string;
    duration: number;

    instructor: {
      id: string | null;
      username: string | null;
      avatar: string | null;
      bio: string | null;
    } | null;
  } | null;

  meta?: Meta;
};

export class EnrollmentMapper {
  private constructor() {}

  static toResponse(this: void, enrollment: Enrollment): EnrollmentResponseDto {
    const course = enrollment.course
      ? CourseMapper.toResponse(enrollment.course)
      : null;
    return {
      id: enrollment.id,
      userId: enrollment.userId,
      courseId: enrollment.courseId,

      status: enrollment.currentStatus,

      enrolledAt: enrollment.enrolledAt,
      createdAt: enrollment.createdAt,

      progressPercentage: enrollment.progressPercentage,

      completedLessons: enrollment.completedLessons,
      course: course
        ? {
            id: course.id,
            image: course.image,
            title: course.title,
            duration: course.duration,
            instructor: course.instructor ?? null,
          }
        : null,
    };
  }
}
