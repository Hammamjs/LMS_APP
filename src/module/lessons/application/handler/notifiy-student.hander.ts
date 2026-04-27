import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { LessonCreatedEvent } from '../../domain/entity/events/lesson-created.event';
import { Inject } from '@nestjs/common';
import {
  INOTIFICATION_REPOSITORY,
  type INotificationSystemRepository,
  Notification,
} from '@/module/notification';
import {
  IENROLLMENT_REPOSITORY,
  type IEnrollmentRepository,
} from '@/module/enrollment';

@EventsHandler(LessonCreatedEvent)
export class NotifyStudentsOnLessonCreatedHandler implements IEventHandler<LessonCreatedEvent> {
  constructor(
    @Inject(INOTIFICATION_REPOSITORY)
    public readonly notification: INotificationSystemRepository,
    @Inject(IENROLLMENT_REPOSITORY)
    public readonly enrollmentRepo: IEnrollmentRepository,
  ) {}

  async handle(event: LessonCreatedEvent) {
    const enrollmentResutl = await this.enrollmentRepo.findAllByCourseId(
      event.courseId,
    );

    if (enrollmentResutl.ok) {
      const notifications = enrollmentResutl.value.map((e) =>
        Notification.create({
          userId: e.getUserId(),
          title: event.courseTitle,
          text: 'New lesson added to the course',
        }),
      );

      await this.notification.saveMany(notifications);
    }
  }
}
