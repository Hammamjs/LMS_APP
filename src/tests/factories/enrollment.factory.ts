import { Enrollment } from '@/module/enrollment';
import { IFactoryTest } from '../repository/factory.interface';
import { CourseFactory } from './course.factory';

type EnrollmentParameters = Parameters<typeof Enrollment.create>[0];
export class EnrollmentFactory implements IFactoryTest<
  EnrollmentParameters,
  Enrollment
> {
  build(params?: Partial<EnrollmentParameters>): Enrollment {
    return EnrollmentFactory.build(params);
  }

  static build(params?: Partial<EnrollmentParameters>) {
    return Enrollment.create({
      userId: 'valid-user-id',
      courseId: 'valid-user-id',
      totalLessonsCount: 1,
      course: CourseFactory.build(),
      ...params,
    });
  }
}
