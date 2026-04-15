import { Test, TestingModule } from '@nestjs/testing';
import { CreateCourseUseCase } from './create-course.usecase';
import { ICOURSE_REPOSITORY } from '../../../domain/constants/injection.token';
import { CourseFactory } from '@/tests';
import { Result } from '@/core/common/domain/result.pattern';
import { Errors } from '@/core/common/domain/err.utils';
import { IUSER_REPOSITORY } from '@/module/users/domain/constants/injection.token';

describe('Create course test cases', () => {
  let usecase: CreateCourseUseCase;

  let mockCourseRepo: {
    findBySlug: jest.Mock;
    save: jest.Mock;
  };

  const errors = {
    COURSE_TITLE_NOT_FOUND: 'A course with this title not found.',
    COURSE_NOT_FOUND: 'A course with this id not found',
    USER_NOT_FOUND: 'User with this id not found',
    DB_ERR: 'Database connection fail',
  };

  let mockUserRepo: { findById: jest.Mock };

  // for testing purposes
  const course = CourseFactory.build();

  const params = {
    category: 'web dev',
    description: 'any description',
    hours: 2,
    image: 'any image',
    instructorId: 'any-id',
    price: 200,
    title: 'JS Advanced',
  };

  beforeEach(async () => {
    mockCourseRepo = {
      save: jest.fn(),
      findBySlug: jest.fn(),
    };

    mockUserRepo = { findById: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCourseUseCase,
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

    usecase = module.get<CreateCourseUseCase>(CreateCourseUseCase);
  });

  it('should pass when data are valid', async () => {
    mockUserRepo.findById.mockResolvedValue(Result.ok({}));

    mockCourseRepo.findBySlug.mockResolvedValue(
      Result.fail(Errors.notFound(errors.COURSE_TITLE_NOT_FOUND)),
    );

    mockCourseRepo.save.mockResolvedValue(Result.ok(course));

    const result = await usecase.execute(params);

    expect(result.ok).toBe(true);
    expect(mockCourseRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should fail when user not found', async () => {
    mockUserRepo.findById.mockResolvedValue(
      Result.fail(Errors.notFound(errors.USER_NOT_FOUND)),
    );

    const result = await usecase.execute(params);

    expect(result.ok).toBe(false);
    expect(mockCourseRepo.save).not.toHaveBeenCalled();
  });

  it('should be fail when course uncreated', async () => {
    mockUserRepo.findById.mockResolvedValue(Result.ok({}));

    mockCourseRepo.findBySlug.mockResolvedValue(
      Result.fail(Errors.notFound(errors.COURSE_TITLE_NOT_FOUND)),
    );

    mockCourseRepo.save.mockResolvedValue(
      Result.fail(Errors.internal(errors.DB_ERR)),
    );

    const result = await usecase.execute(params);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toBe(errors.DB_ERR);
  });

  it('should fail when some required fields are missing', async () => {
    const result = await usecase.execute({ title: '' } as any);

    expect(result.ok).toBe(false);
    expect(mockUserRepo.findById).not.toHaveBeenCalled();
    expect(mockCourseRepo.findBySlug).not.toHaveBeenCalled();
    expect(mockCourseRepo.save).not.toHaveBeenCalled();
  });

  it('should fail when title already exists', async () => {
    mockUserRepo.findById.mockResolvedValue(Result.ok({}));
    mockCourseRepo.findBySlug.mockResolvedValue(Result.ok(course));

    const result = await usecase.execute(params);

    expect(result.ok).toBe(false);
    expect(mockUserRepo.findById).toHaveBeenCalledTimes(1);
    expect(mockCourseRepo.findBySlug).toHaveBeenCalledTimes(1);
    expect(mockCourseRepo.save).not.toHaveBeenCalled();
  });
});
