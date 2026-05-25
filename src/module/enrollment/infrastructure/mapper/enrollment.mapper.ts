import { Prisma } from '@prisma/client';
import { Enrollment } from '../../domain/entity/enrollment.entity';
import { CourseMapper } from '@/module/courses/infrastructure/mapper/course.mapper';

type EnrollmentPrisma = Prisma.EnrollmentGetPayload<Record<string, never>>;

type EnrollmentWithCourse = Prisma.EnrollmentGetPayload<{
  include: {
    course: true;
  };
}>;

export class EnrollmentMapper {
  private constructor() {}

  static toDomain(this: void, raw: EnrollmentWithCourse): Enrollment;
  static toDomain(this: void, raw: EnrollmentPrisma): Enrollment;

  static toDomain(raw: EnrollmentWithCourse): Enrollment {
    return Enrollment.rehydrate({
      ...raw,
      course: raw.course ? CourseMapper.toDomain(raw.course) : null,
    });
  }
}
