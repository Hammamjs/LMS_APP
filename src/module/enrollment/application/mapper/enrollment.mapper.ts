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

// 1. Define the shape of a single mapped item first
export type EnrollmentResponseDto = {
  id: string;
  userId: string;
  courseId: string;
  status: Status;
  enrolledAt: Date;
  createdAt: Date;

  meta?: Meta;
};

export class EnrollmentMapper {
  private constructor() {}

  static toResponse(this: void, enrollment: Enrollment) {
    return {
      id: enrollment.getId(),
      userId: enrollment.getUserId(),
      courseId: enrollment.getCourseId(),
      status: enrollment.getCurrentStatus(),
      enrolledAt: enrollment.getEnrolledAt(),
      createdAt: enrollment.getCreatedAt(),
    };
  }

  // static toPaginateResponse(
  //   data: Enrollment[],
  //   meta: Meta,
  // ): PaginationResult<EnrollmentResponseDto> {
  //   return {
  //     data: data.map((enroll) => this.toResponse(enroll)),
  //     meta,
  //   };
  // }
}
