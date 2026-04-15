import { Injectable } from '@nestjs/common';
import { CreateLessonUsecase } from './usecases/create-lesson/create-lesson.usecase';
import { FindLessonUseCase } from './usecases/find-lesson/find-lesson.usecase';
import { FindLessonsUseCase } from './usecases/find-lessons/find-lessons.usecase';

@Injectable()
export class LessonFacade {
  constructor(
    public readonly create: CreateLessonUsecase,
    public readonly findAll: FindLessonsUseCase,
    public readonly findOne: FindLessonUseCase,
  ) {}
}
