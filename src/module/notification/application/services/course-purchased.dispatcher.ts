import { CoursePurchasedEvent } from '@/module/courses/domain/events/course-purchased.event';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { type INotificationSystemRepository } from '../../domain/repository/notification.repository.interface';
import { NotificationDispatcher } from './notification.dispatcher';
import { Notification } from '../../domain/entity/notification.entity';

@EventsHandler(CoursePurchasedEvent)
export class CoursePurchasedDispatcher implements IEventHandler<CoursePurchasedEvent> {
  constructor(
    private readonly notifyRepo: INotificationSystemRepository,
    private readonly dispatcher: NotificationDispatcher,
  ) {}

  async handle(event: CoursePurchasedEvent) {
    const notification = Notification.create({
      userId: event.userId,
      title: 'Purchase Successful!',
      text: `You are enrolled in ${event.courseName}`,
    });

    await this.notifyRepo.save(notification);
    // real time connection
    this.dispatcher.send(notification);
  }
}
