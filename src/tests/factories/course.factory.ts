import { Course } from '@/module/courses';
import { IFactoryTest } from '../repository/factory.interface';
import { Level } from '@/module/courses/domain/course.types';

type CreateCourseInput = Parameters<typeof Course.create>[0];
export class CourseFactory implements IFactoryTest<CreateCourseInput, Course> {
  private constructor() {}

  build(params?: Partial<CreateCourseInput>): Course {
    return CourseFactory.build(params);
  }

  static build(params?: Partial<CreateCourseInput>): Course {
    const merged = {
      category: 'web dev',
      description: 'any random txt for testing purposes',
      duration: 3,
      instructorId: 'ins-id',
      originalPrice: 30,
      discountPrice: 25,
      level: 'Intermediate' as Level,
      title: 'HTML COURSE',
      image: 'uncoverd',
      language: 'English',
      subtitle: '',
      lessonCount: 2,

      ...params,
    };

    return Course.create({
      ...merged,

      requirements: merged.requirements?.length
        ? merged.requirements
        : ['Basic JavaScript'],

      targetAudience: merged.targetAudience?.length
        ? merged.targetAudience
        : ['Learn basics'],

      whatYouLearn: merged.whatYouLearn?.length
        ? merged.whatYouLearn
        : ['Beginners'],
    });
  }
}
