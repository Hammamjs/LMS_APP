import { Lesson } from '@/module/lessons';
import { IFactoryTest } from '../repository/factory.interface';
import { randomUUID } from 'crypto';

type CreateLessonInput = Parameters<typeof Lesson.create>[0];

export class LessonFactory implements IFactoryTest<CreateLessonInput, Lesson> {
  private constructor() {}

  build(params?: Partial<CreateLessonInput>): Lesson {
    return LessonFactory.build(params);
  }

  static build(params?: Partial<CreateLessonInput>): Lesson {
    return Lesson.create({
      courseId: randomUUID(),
      description: 'any description',
      isFree: false,
      order: 1,
      sourceLink: 'link',
      video: 'video',
      title: 'Css advanced',
      ...params,
    });
  }
}
