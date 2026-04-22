import { Injectable } from '@nestjs/common';
import { CreateLessonUsecase } from './usecases/create-lesson/create-lesson.usecase';
import { FindLessonUseCase } from './usecases/find-lesson/find-lesson.usecase';
import { FindLessonsUseCase } from './usecases/find-lessons/find-lessons.usecase';
import { UpdateLessonUseCase } from './usecases/update-lesson/update-lesson.usecase';
import { DeleteLessonUseCase } from './usecases/delete-lesson/delete-lesson.usecase';

@Injectable()
export class LessonFacade {
  constructor(
    public readonly create: CreateLessonUsecase,
    public readonly findAll: FindLessonsUseCase,
    public readonly findOne: FindLessonUseCase,
    public readonly update: UpdateLessonUseCase,
    public readonly deleteOne: DeleteLessonUseCase,
  ) {}
}
