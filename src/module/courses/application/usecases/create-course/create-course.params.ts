import { Level } from '@/module/courses/domain/course.types';

export class CreateCourseParams {
  constructor(
    public title: string,
    public subtitle: string,
    public level: Level,
    public language: string,
    public whatYouLearn: string[],
    public targetAudience: string[],
    public requirements: string[],
    public duration: number,
    public originalPrice: number,
    public discountPrice: number,
    public description: string,
    public instructorId: string,
    public image: string | null,
    public category: string,
    public lessonCount?: number,
  ) {}
}
