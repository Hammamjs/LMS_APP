import { Level } from '@/module/courses/domain/types/course.types';

export class UpdateCourseParams {
  constructor(
    public id: string,
    public userId: string,
    public requirements?: string[],
    public language?: string,
    public whatYouLearn?: string[],
    public targetAudience?: string[],
    public title?: string,
    public originalPrice?: number,
    public discountPrice?: number,
    public level?: Level,
    public duration?: number,
    public description?: string,
    public image?: string,
    public category?: string,
  ) {}
}
