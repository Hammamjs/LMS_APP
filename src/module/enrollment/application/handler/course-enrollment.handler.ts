import {
  CoursePurchasedEvent,
  ICOURSE_REPOSITORY,
  type ICourseRepository,
} from '@/module/courses';
import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { IENROLLMENT_REPOSITORY } from '../../domain/constants/token.injection';
import { type IEnrollmentRepository } from '../../domain/repository/enrollment.repository.interface';
import { Enrollment } from '../../domain/entity/enrollment.entity';

@EventsHandler(CoursePurchasedEvent)
export class CourseEnrollmentHandler implements IEventHandler<CoursePurchasedEvent> {
  constructor(
    @Inject(IENROLLMENT_REPOSITORY)
    private readonly enrollmentRepo: IEnrollmentRepository,
    @Inject(ICOURSE_REPOSITORY) private readonly courseRepo: ICourseRepository,
  ) {}

  async handle(event: CoursePurchasedEvent) {
    console.log(
      '📝 CourseEnrollmentHandler: Registering database enrollment records...',
    );

    try {
      const courseResult = await this.courseRepo.findById(event.courseId);

      if (!courseResult.ok)
        throw new Error(
          `Course metadata look up failed for ID: ${event.courseId}`,
        );

      const { course: courseEntity } = courseResult.value;

      const newEnrollment = Enrollment.create({
        userId: event.userId,
        courseId: event.courseId,
        totalLessonsCount: courseEntity.lessonCount,
        course: courseEntity,
      });

      const savedResult = await this.enrollmentRepo.save(newEnrollment);

      if (!savedResult.ok)
        throw new Error(
          'Database tier rejected enrollment persistent transaction commit.',
        );
    } catch (err) {
      console.error('❌ Failed to execute system domain enrollment:', err);
    }
  }
}
