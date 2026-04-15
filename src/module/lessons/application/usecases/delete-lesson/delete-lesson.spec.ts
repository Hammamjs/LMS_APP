import { Test, TestingModule } from '@nestjs/testing';
import { DeleteLessonUseCase } from './delete-lesson.usecase';
import { ICOURSE_REPOSITORY } from '@/module/courses';
import { ILESSON_REPOSITORY } from '@/module/lessons/domain/constants/token.injection';
import { IUSER_REPOSITORY, UserRole } from '@/module/users';
import { CourseFactory, LessonFactory, UserFactory } from '@/tests';
import { Errors, Result } from '@/core';
import { Lesson } from '@/module/lessons/domain/entity/lesson.entity';

describe('Delete lesson test cases', () => {
  let usecase: DeleteLessonUseCase,
    mockUserRepo: { findById: jest.Mock },
    mockLessonRepo: { findById: jest.Mock; save: jest.Mock },
    mockCourseRepo: { findById: jest.Mock };

  const errors = {
    FORBIDDEN: 'You are not allowed to perform this action',
    NOT_MATCH: 'This lesson does not belong to the specified course.',
    FAILED: 'Delete failed',
    NOT_FOUND: 'Lesson could not be found',
    USER_NOT_EXIST: 'User not found',
  };

  beforeEach(async () => {
    mockUserRepo = { findById: jest.fn() };
    mockLessonRepo = { findById: jest.fn(), save: jest.fn() };
    mockCourseRepo = { findById: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteLessonUseCase,
        {
          provide: ICOURSE_REPOSITORY,
          useValue: mockCourseRepo,
        },
        {
          provide: ILESSON_REPOSITORY,
          useValue: mockLessonRepo,
        },
        {
          provide: IUSER_REPOSITORY,
          useValue: mockUserRepo,
        },
      ],
    }).compile();

    usecase = module.get<DeleteLessonUseCase>(DeleteLessonUseCase);
  });

  it('should pass when all business logic satisfied', async () => {
    const user = UserFactory.build({ role: UserRole.Instructor });
    const course = CourseFactory.build({ instructorId: user.getId() });
    const lesson = LessonFactory.build({ courseId: course.getId() });

    mockUserRepo.findById.mockResolvedValue(Result.ok(user));
    mockCourseRepo.findById.mockResolvedValue(Result.ok(course));
    mockLessonRepo.findById.mockResolvedValue(Result.ok(lesson));

    mockLessonRepo.save.mockResolvedValue(Result.ok(lesson));

    const result = await usecase.execute({
      courseId: course.getId(),
      id: lesson.getId(),
      userId: user.getId(),
    });

    expect(result.ok).toBeTruthy();

    if (result.ok) expect(result.value).toEqual(undefined);
    expect(mockUserRepo.findById).toHaveBeenCalled();
    expect(mockCourseRepo.findById).toHaveBeenCalled();
    expect(mockLessonRepo.findById).toHaveBeenCalledTimes(1);
    expect(mockLessonRepo.save).toHaveBeenCalledTimes(1);

    const [savedLesson] = mockLessonRepo.save.mock.calls[0] as [Lesson];

    expect(savedLesson.isDeletedLesson()).toBe(true);
  });

  it('should fail when user not an instructor [validation layer]', async () => {
    const user = UserFactory.build();
    const course = CourseFactory.build();
    const lesson = LessonFactory.build({ courseId: course.getId() });

    mockUserRepo.findById.mockResolvedValue(Result.ok(user));
    mockCourseRepo.findById.mockResolvedValue(Result.ok(course));
    mockLessonRepo.findById.mockResolvedValue(Result.ok(lesson));

    const result = await usecase.execute({
      courseId: course.getId(),
      userId: user.getId(),
      id: lesson.getId(),
    });

    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.error).toEqual(Errors.forbidden(errors.FORBIDDEN));
    expect(mockLessonRepo.save).not.toHaveBeenCalled();
  });

  it('should fail when course not owned by the instructor', async () => {
    const course = CourseFactory.build();
    const user = UserFactory.build({ role: UserRole.Instructor });
    const lesson = LessonFactory.build({ courseId: course.getId() });

    mockCourseRepo.findById.mockResolvedValue(Result.ok(course));
    mockUserRepo.findById.mockResolvedValue(Result.ok(user));
    mockLessonRepo.findById.mockResolvedValue(Result.ok(lesson));

    const result = await usecase.execute({
      courseId: course.getId(),
      userId: user.getId(),
      id: lesson.getId(),
    });

    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.error).toEqual(Errors.forbidden(errors.FORBIDDEN));
  });

  it("should fail when course doesn't belong to the course", async () => {
    const user = UserFactory.build({ role: UserRole.Instructor });
    const course = CourseFactory.build({ instructorId: user.getId() });
    // by default courseId in lesson not equal for course id
    // *** unless we override it ***
    const lesson = LessonFactory.build();

    mockUserRepo.findById.mockResolvedValue(Result.ok(user));
    mockCourseRepo.findById.mockResolvedValue(Result.ok(course));
    mockLessonRepo.findById.mockResolvedValue(Result.ok(lesson));

    const result = await usecase.execute({
      courseId: course.getId(),
      userId: user.getId(),
      id: lesson.getId(),
    });

    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.error).toEqual(Errors.forbidden(errors.NOT_MATCH));
  });

  it('should fail when changes not saved', async () => {
    const user = UserFactory.build({ role: UserRole.Instructor });
    const course = CourseFactory.build({ instructorId: user.getId() });
    const lesson = LessonFactory.build({ courseId: course.getId() });

    mockUserRepo.findById.mockResolvedValue(Result.ok(user));
    mockCourseRepo.findById.mockResolvedValue(Result.ok(course));
    mockLessonRepo.findById.mockResolvedValue(Result.ok(lesson));

    mockLessonRepo.save.mockResolvedValue(
      Result.fail(Errors.internal(errors.FAILED)),
    );

    const result = await usecase.execute({
      courseId: course.getId(),
      userId: user.getId(),
      id: lesson.getId(),
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toBe(errors.FAILED);
  });

  it('should fail when lesson not found', async () => {
    mockUserRepo.findById.mockResolvedValue(Result.ok(UserFactory.build()));
    mockCourseRepo.findById.mockResolvedValue(Result.ok(CourseFactory.build()));

    mockLessonRepo.findById.mockResolvedValue(
      Result.fail(Errors.notFound(errors.NOT_FOUND)),
    );

    const result = await usecase.execute({
      userId: 'any-id',
      courseId: 'any-id',
      id: 'non-existing-id',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toBe(errors.NOT_FOUND);
    expect(mockLessonRepo.save).not.toHaveBeenCalled();
  });

  it('should fail when failed to fetch user [early exit]', async () => {
    // *** Simulate fetching user failed ***
    mockUserRepo.findById.mockResolvedValue(
      Result.fail(Errors.notFound(errors.USER_NOT_EXIST)),
    );

    mockCourseRepo.findById.mockResolvedValue(Result.ok(CourseFactory.build()));
    mockLessonRepo.findById.mockResolvedValue(Result.ok(LessonFactory.build()));

    const result = await usecase.execute({
      userId: 'non-existen-user-id',
      courseId: 'course-id',
      id: 'lesson-id',
    });

    expect(result.ok).toBe(false);
    expect(mockLessonRepo.save).not.toHaveBeenCalled();
    if (!result.ok) expect(result.error.message).toBe(errors.USER_NOT_EXIST);
  });
});
