import { lessons as PrismaLesson } from '@prisma/client';
import { Lesson } from '../../domain/entity/lesson.entity';
export class LessonMapper {
  private constructor() {}

  // To map database query to lesson entity
  // reHydration entity
  public static toDomain(rawLesson: PrismaLesson): Lesson {
    return Lesson.rehydrate(rawLesson);
  }

  public static toDomainList(rawLesson: PrismaLesson[]): Lesson[] {
    return rawLesson.map((raw) => this.toDomain(raw));
  }
}
