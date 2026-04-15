import { Test, TestingModule } from '@nestjs/testing';
import { CreateLessonUsecase } from './create-lesson.usecase';
import { ICOURSE_REPOSITORY } from '@/module/courses';
import { IUSER_REPOSITORY, UserRole } from '@/module/users';
import { ILESSON_REPOSITORY } from '@/module/lessons/domain/constants/token.injection';
import { Errors, Result } from '@/core';
import { CourseFactory, UserFactory } from '@/tests';

describe('Create lesson test cases', () => {
  let usecase: CreateLessonUsecase;

  let mockUserRepo: { findById: jest.Mock },
    mockLessonRepo: { save: jest.Mock; findLastOrderByCourse: jest.Mock },
    mockCourseRepo: { findById: jest.Mock };

  beforeEach(async () => {
    mockUserRepo = { findById: jest.fn() };
    mockLessonRepo = { findLastOrderByCourse: jest.fn(), save: jest.fn() };
    mockCourseRepo = { findById: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateLessonUsecase,
        {
          provide: ICOURSE_REPOSITORY,
          useValue: mockCourseRepo,
        },
        {
          provide: IUSER_REPOSITORY,
          useValue: mockUserRepo,
        },
        {
          provide: ILESSON_REPOSITORY,
          useValue: mockLessonRepo,
        },
      ],
    }).compile();

    usecase = module.get<CreateLessonUsecase>(CreateLessonUsecase);
  });

  it('should success when business logic satisfied', async () => {
    const user = UserFactory.build({ role: UserRole.Instructor }),
      course = CourseFactory.build({ instructorId: user.getId() });

    mockCourseRepo.findById.mockResolvedValue(Result.ok(course));
    mockUserRepo.findById.mockResolvedValue(Result.ok(user));

    const lastOrder = 5;
    mockLessonRepo.findLastOrderByCourse.mockResolvedValue(
      Result.ok(lastOrder),
    );

    mockLessonRepo.save.mockImplementation((lesson) =>
      Promise.resolve(Result.ok(lesson)),
    );

    const result = await usecase.execute({
      courseId: course.getId(),
      description: 'any description',
      isFree: false,
      sourceLink: 'link',
      video: null,
      title: 'Introduction to css',
      userId: user.getId(),
    });

    expect(result.ok).toBeTruthy();

    if (result.ok) {
      expect(result.value.title).toBe('Introduction to css');
    }

    expect(mockLessonRepo.findLastOrderByCourse).toHaveBeenCalledWith(
      course.getId(),
    );
  });

  it('should fail when user not exists', async () => {
    mockUserRepo.findById.mockResolvedValue(
      Result.fail(Errors.notFound('User not found')),
    );

    mockCourseRepo.findById.mockResolvedValue(Result.ok({}));

    mockLessonRepo.findLastOrderByCourse.mockResolvedValue(Result.ok(2));

    const result = await usecase.execute({
      courseId: 'uuid',
      description: 'any description',
      isFree: false,
      sourceLink: 'link',
      video: null,
      title: 'Introduction to css',
      userId: 'uuid',
    });

    expect(result.ok).toBe(false);

    if (!result.ok) expect(result.error.message).toBe('User not found');
  });

  it('should fail when user not an instructor', async () => {
    // By default : user is student
    // and we will not override the default behavior
    const user = UserFactory.build();

    // the instructor by default different from user id
    // we need to override it
    const course = CourseFactory.build({ instructorId: user.getId() });

    mockUserRepo.findById.mockResolvedValue(Result.ok(user));
    mockCourseRepo.findById.mockResolvedValue(Result.ok(course));

    mockLessonRepo.findLastOrderByCourse.mockResolvedValue(Result.ok(5));

    const result = await usecase.execute({
      courseId: course.getId(),
      description: 'any description',
      isFree: false,
      sourceLink: 'link',
      video: null,
      title: 'Introduction to css',
      userId: user.getId(),
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toEqual(
        Errors.forbidden('Only instructors can create lessons'),
      );
    }
    expect(mockLessonRepo.save).not.toHaveBeenCalled();
  });

  it('should fail when course owner and lesson creator different', async () => {
    const user = UserFactory.build({ role: UserRole.Instructor });
    const course = CourseFactory.build();

    mockUserRepo.findById.mockResolvedValue(Result.ok(user));
    mockCourseRepo.findById.mockResolvedValue(Result.ok(course));
    mockLessonRepo.findLastOrderByCourse.mockResolvedValueOnce(Result.ok(3));

    const result = await usecase.execute({
      courseId: course.getId(),
      description: 'any description',
      isFree: false,
      sourceLink: 'link',
      video: null,
      title: 'Introduction to css',
      userId: user.getId(),
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error).toEqual(
        Errors.forbidden('This permission not allowed for you'),
      );
      expect(mockLessonRepo.save).not.toHaveBeenCalled();
      expect(mockUserRepo.findById).toHaveBeenCalledTimes(1);
    }
  });

  it('should fail when failed to fetch lesson list', async () => {
    const user = UserFactory.build({ role: UserRole.Instructor });
    const course = CourseFactory.build({ instructorId: user.getId() });

    mockUserRepo.findById.mockResolvedValue(Result.ok(user));
    mockCourseRepo.findById.mockResolvedValue(Result.ok(course));

    mockLessonRepo.findLastOrderByCourse.mockResolvedValue(
      Result.fail(
        Errors.notFound('Unknown error occured when fetching order list'),
      ),
    );

    const result = await usecase.execute({
      courseId: course.getId(),
      description: 'any description',
      isFree: false,
      sourceLink: 'link',
      video: null,
      title: 'Introduction to css',
      userId: user.getId(),
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.message).toBe(
        'Unknown error occured when fetching order list',
      );
    }

    expect(mockLessonRepo.save).not.toHaveBeenCalled();
  });

  it('should fail when database failed to save', async () => {
    const user = UserFactory.build({ role: UserRole.Instructor });
    const course = CourseFactory.build({ instructorId: user.getId() });

    mockCourseRepo.findById.mockResolvedValue(Result.ok(course));
    mockUserRepo.findById.mockResolvedValue(Result.ok(user));

    mockLessonRepo.findLastOrderByCourse.mockResolvedValue(Result.ok(2));

    mockLessonRepo.save.mockResolvedValue(
      Result.fail(Errors.internal('Save new lesson failed')),
    );

    const result = await usecase.execute({
      courseId: course.getId(),
      description: 'any description',
      isFree: false,
      sourceLink: 'link',
      video: null,
      title: 'Introduction to css',
      userId: user.getId(),
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.message).toBe('Save new lesson failed');
    }
  });
});
