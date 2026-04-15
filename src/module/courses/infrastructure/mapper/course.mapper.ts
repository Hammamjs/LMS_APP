import { courses as PrismaCourse } from '@prisma/client';
import { Course } from '../../domain/entity/course.entity';
export class CourseMapper {
  private constructor() {}
  public static toDomain(row: PrismaCourse) {
    return Course.rehydrate(row);
  }
}
