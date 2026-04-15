import { Course } from '@/module/courses';
import { IFactoryTest } from '../repository/factory.interface';
import { randomUUID } from 'crypto';

type CreateCourseInput = Parameters<typeof Course.create>[0];
export class CourseFactory implements IFactoryTest<CreateCourseInput, Course> {
  private constructor() {}

  build(params?: Partial<CreateCourseInput>): Course {
    return CourseFactory.build(params);
  }

  static build(params?: Partial<CreateCourseInput>): Course {
    return Course.create({
      category: 'web dev',
      description: 'any random txt for testing purposes',
      hours: 3,
      instructorId: randomUUID(),
      price: 30,
      title: 'HTML COURSE',
      image: 'uncoverd',
      ...params,
    });
  }
}
