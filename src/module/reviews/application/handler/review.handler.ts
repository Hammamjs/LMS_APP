import { Inject } from '@nestjs/common';
import { ReviewChangeEvent } from '../../domain/event/review.event';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ICOURSE_REPOSITORY, type ICourseRepository } from '@/module/courses';
import { ILOGGER_SERVICE, type ILoggerService } from '@/core';

@EventsHandler(ReviewChangeEvent)
export class ReviewChangeHandler implements IEventHandler<ReviewChangeEvent> {
  constructor(
    @Inject(ICOURSE_REPOSITORY) private readonly courseRepo: ICourseRepository,
    @Inject(ILOGGER_SERVICE) private readonly logger: ILoggerService,
  ) {}

  async handle(event: ReviewChangeEvent) {
    const { action, courseId } = event;

    console.log(
      `[CQRS Event]: Review state marked as "${action}" on course ${courseId}.`,
    );

    try {
      await this.courseRepo.recalculateReviewMetrics(courseId);
    } catch (err) {
      this.logger.error(
        `CQRS aggregate worker failed for course ${courseId}:`,
        err instanceof Error ? err.stack : String(err),
      );
    }
  }
}
