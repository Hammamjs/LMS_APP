import {
  Course as PrismaCourse,
  User as PrismaUser,
  Lesson as PrismaLesson,
} from '@prisma/client';
import { Course } from '../../domain/entity/course.entity';
import { Level } from '../../domain/course.types';

type PrismaUserWithBio = PrismaUser & {
  bio?: string | null; // Or whatever field name your Prisma schema uses (e.g., biography)
};
// Defining the type to allow for optional relations from Prisma
type PrismaCourseWithOptionalRelations = PrismaCourse & {
  instructor?: PrismaUserWithBio;
  lessons?: PrismaLesson[];
  _count?: {
    lessons?: number;
  };
};

export type CourseWithInstructorData = {
  course: Course;
  instructorData?: {
    id: string;
    username: string;
    avatar: string | null;
    bio: string | null;
  };
};

export class CourseMapper {
  private constructor() {}

  public static toDomainWithInstructor(
    raw: PrismaCourseWithOptionalRelations,
  ): CourseWithInstructorData {
    // 1. Map pure domain object without instructor properties
    const course = Course.rehydrate({
      id: raw.id,
      title: raw.title,
      slug: raw.slug,
      description: raw.description,
      image: raw.image,
      originalPrice: raw.originalPrice,
      discountPrice: raw.discountPrice,
      duration: raw.duration,
      rating: raw.rating,
      subtitle: raw.subtitle,
      category: raw.category,
      level: raw.level as Level,
      instructorId: raw.instructorId,
      lessonCount: raw._count?.lessons,
      isDeleted: raw.isDeleted,
      purchaseCount: raw.purchaseCount,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      requirements: raw.requirements,
      language: raw.language ?? 'English',
      whatYouLearn: raw.whatYouLearn,
      targetAudience: raw.targetAudience,
    });

    const instructorData = raw.instructor
      ? {
          id: raw.instructor.id,
          username: raw.instructor.username,
          avatar: raw.instructor.avatar,
          bio: raw.instructor.bio ?? null,
        }
      : undefined;

    return { course, instructorData };
  }

  public static toDomain(raw: PrismaCourseWithOptionalRelations): Course {
    return Course.rehydrate({
      id: raw.id,
      title: raw.title,
      slug: raw.slug,
      description: raw.description,
      image: raw.image,
      originalPrice: raw.originalPrice,
      discountPrice: raw.discountPrice,
      duration: raw.duration,
      rating: raw.rating,
      subtitle: raw.subtitle,
      category: raw.category,
      level: raw.level as Level,
      instructorId: raw.instructorId,
      lessonCount: raw._count?.lessons,
      isDeleted: raw.isDeleted,
      purchaseCount: raw.purchaseCount,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      requirements: raw.requirements,
      language: raw.language ?? 'English',
      whatYouLearn: raw.whatYouLearn,
      targetAudience: raw.targetAudience,
    });
  }
}
