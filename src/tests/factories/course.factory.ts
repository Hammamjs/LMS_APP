import { Course } from '@/module/courses/domain/entity/course.entity';

export class CourseFactory {
  static build(props: Partial<any> = {}): Course {
    return Course.create({
      category: 'web dev',
      description: 'any random txt for testing purposes',
      hours: 3,
      instructorId: 'random-uuid',
      price: 30,
      title: 'HTML COURSE',
      image: 'uncoverd',
      ...props,
    });
  }
}
