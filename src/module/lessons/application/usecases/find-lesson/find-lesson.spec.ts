import { Test, TestingModule } from '@nestjs/testing';
import { FindLessonUseCase } from './find-lesson.usecase';
import { ILESSON_REPOSITORY } from '@/module/lessons';
import { IENROLLMENT_REPOSITORY } from '@/module/enrollment';
import { LessonFactory } from '@/tests';
import { Errors, Result } from '@/core';

describe('Find lesson test cases', () => {
  let usecase: FindLessonUseCase,
    mockEnrollmentRepo: { findByCourseAndUser: jest.Mock },
    mockLessonRepo: { findById: jest.Mock };

  const errors = {
    FORBIDDEN: 'Purchase required or access revoked.',
    LESSON_NOT_FOUND: 'Lesson not found might not exists',
  };

  beforeEach(async () => {
    mockEnrollmentRepo = { findByCourseAndUser: jest.fn() };
    mockLessonRepo = { findById: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindLessonUseCase,
        {
          provide: ILESSON_REPOSITORY,
          useValue: mockLessonRepo,
        },
        {
          provide: IENROLLMENT_REPOSITORY,
          useValue: mockEnrollmentRepo,
        },
      ],
    }).compile();
    usecase = module.get<FindLessonUseCase>(FindLessonUseCase);
  });

  it('should pass when enrolled with course', async () => {
    const lesson = LessonFactory.build();

    mockLessonRepo.findById.mockResolvedValue(Result.ok(lesson));
    mockEnrollmentRepo.findByCourseAndUser.mockResolvedValue(
      Result.ok({
        isActive: () => true,
      }),
    );

    const result = await usecase.execute({
      id: lesson.getId(),
      userId: 'user-id',
    });

    expect(result.ok).toBeDefined();
    expect(result.ok).toBeTruthy();
  });

  it('should pass when lesson is free', async () => {
    const lesson = LessonFactory.build({ isFree: true });

    mockLessonRepo.findById.mockResolvedValue(Result.ok(lesson));
    mockEnrollmentRepo.findByCourseAndUser.mockResolvedValue(Result.ok({}));

    const result = await usecase.execute({
      userId: 'user-id',
      id: lesson.getId(),
    });

    expect(result.ok).toBeDefined();
    expect(result.ok).toBeTruthy();
    expect(mockLessonRepo.findById).toHaveBeenCalled();
    expect(mockEnrollmentRepo.findByCourseAndUser).not.toHaveBeenCalled();
  });

  it('should fail when course is paid and user not enrolled', async () => {
    const lesson = LessonFactory.build();

    mockLessonRepo.findById.mockResolvedValue(Result.ok(lesson));
    mockEnrollmentRepo.findByCourseAndUser.mockResolvedValue(
      Result.fail(Errors.forbidden(errors.FORBIDDEN)),
    );

    const result = await usecase.execute({
      id: lesson.getId(),
      userId: 'user-id',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toBe(errors.FORBIDDEN);
    expect(mockLessonRepo.findById).toHaveBeenCalled();
    expect(mockEnrollmentRepo.findByCourseAndUser).toHaveBeenCalled();
  });

  it('should fail when lesson not found', async () => {
    mockLessonRepo.findById.mockResolvedValue(
      Result.fail(Errors.notFound(errors.LESSON_NOT_FOUND)),
    );

    const result = await usecase.execute({
      id: 'non-existen-id',
      userId: 'user-id',
    });

    expect(result.ok).toBe(false);
    expect(mockEnrollmentRepo.findByCourseAndUser).not.toHaveBeenCalled();
    if (!result.ok) expect(result.error.message).toBe(errors.LESSON_NOT_FOUND);
  });
});
