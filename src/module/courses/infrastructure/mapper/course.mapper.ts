import { courses as PrismaCourse } from '@prisma/client';
import { Course } from '../../domain/entity/course.entity';
export class CourseMapper {
  private constructor() {}
  public static toDomain(row: PrismaCourse) {
    return Course.rehydrate({
      id: row.id,
      title: row.title,
      price: row.price,
      hours: row.hours,
      slug: row.slug,
      description: row.description,
      rating: row.rating,
      purchaseCount: row.purchaseCount,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      instructorId: row.instructorId,
      category: row.category,
      image: row.image,
    });
  }
}
