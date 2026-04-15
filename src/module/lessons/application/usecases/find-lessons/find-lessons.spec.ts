import { Test, TestingModule } from '@nestjs/testing';
import { FindLessonsUseCase } from './find-lessons.usecase';
import { ICOURSE_REPOSITORY } from '@/module/courses';
import { ILESSON_REPOSITORY } from '@/module/lessons/domain/constants/token.injection';
import { CourseFactory, LessonFactory } from '@/tests';
import { Errors, Result } from '@/core';

describe('Find lessons test cases', () => {
  let usecase: FindLessonsUseCase,
    mockCourseRepo: { findById: jest.Mock },
    mockLessonRepo: { findAll: jest.Mock };

  const errors = {
    COURSE_NOT_FOUND: 'Course not found',
    LESSONS_NOT_FOUND: 'No lessons could be found',
  };

  beforeEach(async () => {
    mockCourseRepo = { findById: jest.fn() };
    mockLessonRepo = { findAll: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindLessonsUseCase,
        {
          provide: ICOURSE_REPOSITORY,
          useValue: mockCourseRepo,
        },
        {
          provide: ILESSON_REPOSITORY,
          useValue: mockLessonRepo,
        },
      ],
    }).compile();

    usecase = module.get<FindLessonsUseCase>(FindLessonsUseCase);
  });

  it('should pass when all logic satisfied', async () => {
    const course = CourseFactory.build();
    const lessont1 = LessonFactory.build({
      title: 'Introduction to javascript',
      courseId: course.getId(),
    });
    const lessont2 = LessonFactory.build({
      title: 'Introduction to variables',
      courseId: course.getId(),
    });

    const lessons = [lessont1, lessont2];

    mockCourseRepo.findById.mockResolvedValue(Result.ok(course));
    mockLessonRepo.findAll.mockResolvedValue(
      Result.ok({
        data: lessons,
        meta: {},
      }),
    );

    const courseId = course.getId();

    const result = await usecase.execute({ courseId });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.value.data[0].title).toBe('Introduction to javascript');
    }

    expect(mockLessonRepo.findAll).toHaveBeenCalledWith({ courseId });
    expect(mockCourseRepo.findById).toHaveBeenCalledWith(courseId);
  });

  it('should fail when course not found', async () => {
    mockCourseRepo.findById.mockResolvedValue(
      Result.fail(Errors.notFound(errors.COURSE_NOT_FOUND)),
    );

    const result = await usecase.execute({ courseId: 'any-id' });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toBe(errors.COURSE_NOT_FOUND);
    expect(mockCourseRepo.findById).toHaveBeenCalledTimes(1);
  });

  it('should fail when lesson not found or cannot loaded', async () => {
    const course = CourseFactory.build();

    mockCourseRepo.findById.mockResolvedValue(Result.ok(course));
    mockLessonRepo.findAll.mockResolvedValue(
      Result.fail(Errors.notFound(errors.LESSONS_NOT_FOUND)),
    );

    const result = await usecase.execute({ courseId: course.getId() });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toBe(errors.LESSONS_NOT_FOUND);
    expect(mockCourseRepo.findById).toHaveBeenCalledTimes(1);
  });
});
