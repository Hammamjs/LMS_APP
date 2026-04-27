import { Test, TestingModule } from '@nestjs/testing';
import { UpdateCourseUseCase } from './update-course.usecase';
import { ICOURSE_REPOSITORY } from '../../domain/constants/injection.token';
import { IUSER_REPOSITORY } from '@/module/users';
import { Result, Errors } from '@/core';
import { CourseFactory } from '@/tests';
import { CourseMapper } from '../../domain/entity/course-mapper';

describe('Update course test cases', () => {
  const errors = {
    TITLE_NOT_FOUND: 'A course with this title not found',
    COURSE_NOT_FOUND: 'No course found with this id',
    DB_ERR: 'Databse connection error',
  };

  let usecase: UpdateCourseUseCase;
  let mockCourseRepo: {
    save: jest.Mock;
    findById: jest.Mock;
    findBySlug: jest.Mock;
  };

  let mockUserRepo: { findById: jest.Mock };

  const course = CourseFactory.build();

  beforeEach(async () => {
    mockCourseRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
    };
    mockUserRepo = { findById: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateCourseUseCase,
        {
          provide: ICOURSE_REPOSITORY,
          useValue: mockCourseRepo,
        },
        {
          provide: IUSER_REPOSITORY,
          useValue: mockUserRepo,
        },
      ],
    }).compile();

    usecase = module.get<UpdateCourseUseCase>(UpdateCourseUseCase);
  });

  it('should update user when id and data are valid', async () => {
    const updatedCourse = course.withTitle('Advanced javascript');

    mockUserRepo.findById.mockResolvedValue(Result.ok(course));

    mockCourseRepo.findById.mockResolvedValue(Result.ok(updatedCourse));

    mockCourseRepo.findBySlug.mockResolvedValue(
      Result.fail(Errors.notFound(errors.TITLE_NOT_FOUND)),
    );

    mockCourseRepo.save.mockResolvedValue(Result.ok(updatedCourse));

    const result = await usecase.execute({
      id: 'id-123',
      category: 'Web development',
      userId: updatedCourse.getInstructor(),
    });

    const expectedData = CourseMapper.toResponse(updatedCourse);

    expect(result.ok).toBeTruthy();
    if (result.ok) expect(result.value).toEqual(expectedData);
  });

  it('should fail when id not found', async () => {
    mockCourseRepo.findById.mockResolvedValue(
      Result.fail(Errors.notFound(errors.COURSE_NOT_FOUND)),
    );

    const result = await usecase.execute({
      id: 'non-exisiting-id',
      userId: 'ins-id',
    });

    expect(result.ok).toBe(false);
    expect(mockUserRepo.findById).not.toHaveBeenCalled();
    expect(mockCourseRepo.findBySlug).not.toHaveBeenCalled();
    expect(mockCourseRepo.save).not.toHaveBeenCalled();
  });

  it('should fail when conflict occur', async () => {
    mockCourseRepo.findById.mockResolvedValue(Result.ok(course));

    const updatedCourseTitle = course.withTitle('Css3');

    mockCourseRepo.findBySlug.mockResolvedValue(Result.ok(updatedCourseTitle));

    const result = await usecase.execute({
      id: 'any-id',
      title: 'Css3',
      userId: course.getInstructor(),
    });

    expect(result.ok).toBe(false);
    expect(mockCourseRepo.save).not.toHaveBeenCalled();
  });

  it('should fail when someone try to update course and his not have permission', async () => {
    mockUserRepo.findById.mockResolvedValue(Result.ok(course));

    mockCourseRepo.findById.mockResolvedValue(Result.ok(course));

    mockCourseRepo.findBySlug.mockResolvedValue(
      Result.fail(Errors.notFound(errors.TITLE_NOT_FOUND)),
    );

    const result = await usecase.execute({
      id: course.getId(),
      userId: 'different-id',
      category: 'new title',
    });

    expect(result.ok).toBe(false);
    expect(mockCourseRepo.save).not.toHaveBeenCalled();
  });

  it('should return message when saving update failed', async () => {
    mockCourseRepo.findById.mockResolvedValue(Result.ok(course));
    mockCourseRepo.findBySlug.mockResolvedValue(
      Result.fail(Errors.notFound(errors.TITLE_NOT_FOUND)),
    );
    mockUserRepo.findById.mockResolvedValue(Result.ok(course));

    mockCourseRepo.save.mockResolvedValue(
      Result.fail(Errors.internal(errors.DB_ERR)),
    );

    const result = await usecase.execute({
      id: 'id-1234',
      category: 'new cat',
      userId: course.getInstructor(),
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toBe(errors.DB_ERR);
  });
});
