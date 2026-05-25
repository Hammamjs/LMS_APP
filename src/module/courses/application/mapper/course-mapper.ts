import { Level } from '../../domain/course.types';
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
  duration: number;
  originalPrice: number;
  discountPrice: number;
  category: string;
  subtitle: string;
  createdAt: Date;
  instructorId: string;
  image: string | null;
  level: Level;
  lessonCount?: number;
  requirements: string[];
  language: string;
  whatYouLearn: string[];
  targetAudience: string[];

  instructor?: {
    id: string | null;
    username: string | null;
    avatar: string | null;
    bio: string | null;
  };

  meta?: Meta;
};

export class CourseMapper {
  public static toResponse(
    this: void,
    course: Course,
    rawInstructor?: {
      id: string;
      username: string;
      avatar: string | null;
      bio: string | null;
    },
  ): CourseResponseDto {
    const response: CourseResponseDto = {
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      duration: course.duration,
      originalPrice: course.originalPrice,
      discountPrice: course.discountPrice,
      category: course.category,
      createdAt: course.createdAt,
      instructorId: course.instructorId,
      image: course.image,
      level: course.level,
      subtitle: course.subtitle,
      requirements: course.requirements,
      whatYouLearn: course.whatYouWillLearn,
      language: course.language,
      targetAudience: course.targetAudience,
    };

    if (rawInstructor) {
      response.instructor = {
        id: rawInstructor.id ?? null,
        username: rawInstructor.username,
        avatar: rawInstructor.avatar,
        bio: rawInstructor.bio,
      };
    }

    const lessonCount = course.lessonCount;

    if (lessonCount != undefined) response.lessonCount = lessonCount;

    return response;
  }
}

export type ICourseMapperResponse = ReturnType<typeof CourseMapper.toResponse>;
export type ICourseMapperPaginationResult = CourseResponseDto;
