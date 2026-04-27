import { Errors, IUseCase, Result } from '@/core';
import { Inject, Injectable } from '@nestjs/common';
import { CreateLessonParams } from './create-lesson.params';
import {
  ILESSON_REPOSITORY,
  type ILessonRepository,
  Lesson,
} from '@/module/lessons';
import { ICOURSE_REPOSITORY, type ICourseRepository } from '@/module/courses';

import { IUSER_REPOSITORY, type IUserRepository } from '@/module/users';
import {
  LessonMapper,
  LessonResponseType,
} from '../../mapper/lesson-mapper.response';

import { EventBus } from '@nestjs/cqrs';
import { LessonCreatedEvent } from '@/module/lessons/domain/entity/events/lesson-created.event';

@Injectable()
export class CreateLessonUsecase implements IUseCase<
  CreateLessonParams,
  Promise<Result<LessonResponseType>>
> {
  constructor(
    @Inject(ILESSON_REPOSITORY) private readonly lessonRepo: ILessonRepository,
    @Inject(ICOURSE_REPOSITORY) private readonly courseRepo: ICourseRepository,
    @Inject(IUSER_REPOSITORY) private readonly userRepo: IUserRepository,
    public readonly eventBus: EventBus,
  ) {}

  async execute(
    params: CreateLessonParams,
  ): Promise<Result<LessonResponseType>> {
    const courseResult = await this.courseRepo.findById(params.courseId);
    if (!courseResult.ok) return courseResult;

    const course = courseResult.value;

    // we need to get last order of lessons in course
    const orderResult = await this.lessonRepo.findLastOrderByCourse(
      params.courseId,
    );

    if (!orderResult.ok)
      return Result.fail(
        Errors.internal('Unknown error occured when fetching order list'),
      );

    // to add security layer we need to check if this instructor the course creator

    const userResult = await this.userRepo.findById(params.userId);

    if (!userResult.ok) return userResult;

    const user = userResult.value;

    // we need to check this is instructor first
    if (!user.isInstructor())
      return Result.fail(
        Errors.forbidden('Only instructors can create lessons'),
      );

    // we need instructor id
    if (!course.isOwnedBy(user.getId()))
      return Result.fail(
        Errors.forbidden('This permission not allowed for you'),
      );

    const order = orderResult.value + 1;

    const createLesson = Lesson.create({ order, ...params });

    const saveInDbResult = await this.lessonRepo.save(createLesson);

    if (!saveInDbResult.ok)
      return Result.fail(Errors.internal('Save new lesson failed'));

    const response = LessonMapper.toResponse(saveInDbResult.value);
    // Before send response we need to send notification for subscriber
    // we need to get who enrolled to this course

    this.eventBus.publish(
      new LessonCreatedEvent(params.title, params.courseId, course.getTitle()),
    );
    return Result.ok(response);
  }
}
