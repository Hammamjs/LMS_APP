import { Test, TestingModule } from '@nestjs/testing';
import { DeleteCourseUseCase } from './delete-course.usecase';
import { ICOURSE_REPOSITORY } from '../../../domain/constants/injection.token';
import { Result } from '@/core/common/domain/result.pattern';
import { Errors } from '@/core/common/domain/err.utils';
import { CourseFactory } from '@/tests';

describe('Delete course test cases', () => {
  let usecase: DeleteCourseUseCase;
  let mockCourseRepo: { save: jest.Mock; findById: jest.Mock };

  const errors = {
    DB_ERR: 'Database connection error',
    COURSE_NOT_FOUND: 'Course with this id not found',
  };

  beforeEach(async () => {
    mockCourseRepo = { save: jest.fn(), findById: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteCourseUseCase,
        {
          provide: ICOURSE_REPOSITORY,
          useValue: mockCourseRepo,
        },
      ],
    }).compile();

    usecase = module.get<DeleteCourseUseCase>(DeleteCourseUseCase);
  });

  it('should mark course as deleted in database', async () => {
    const instructorId = 'any-vlaid-id';
    const courseEntity = CourseFactory.build({ instructorId });

    mockCourseRepo.findById.mockResolvedValue(
      Result.ok({
        course: courseEntity,
        instructorData: {
          id: instructorId,
          username: 'test-user',
          avatar: null,
          bio: null,
        },
      }),
    );
    mockCourseRepo.save.mockResolvedValue(Result.ok(courseEntity));

    const result = await usecase.execute({
      id: courseEntity.id,
      currentUserId: instructorId,
    });

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe(undefined);
  });

  it('should fail when course not found', async () => {
    mockCourseRepo.findById.mockResolvedValue(
      Result.fail(Errors.notFound(errors.COURSE_NOT_FOUND)),
    );

    const result = await usecase.execute({
      id: 'non-exisiting-id',
      currentUserId: 'any-id',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toBe(errors.COURSE_NOT_FOUND);
    expect(mockCourseRepo.save).not.toHaveBeenCalled();
  });

  it('should fail when the owner of the course and currentUserId mismatched', async () => {
    const courseEntity = CourseFactory.build({ instructorId: 'owner-id' });

    mockCourseRepo.findById.mockResolvedValue(
      Result.ok({
        course: courseEntity,
        instructorData: {
          id: 'owner-id',
          username: 'owner',
          avatar: null,
          bio: null,
        },
      }),
    );

    const result = await usecase.execute({
      id: courseEntity.id,
      currentUserId: 'mismatched-id',
    });

    expect(result.ok).toBe(false);
  });

  it('should fail when database failed to save changes', async () => {
    const instructorId = 'in-id';
    const courseEntity = CourseFactory.build({ instructorId });

    mockCourseRepo.findById.mockResolvedValue(
      Result.ok({
        course: courseEntity,
        instructorData: {
          id: instructorId,
          username: 'test',
          avatar: null,
          bio: null,
        },
      }),
    );
    mockCourseRepo.save.mockResolvedValue(
      Result.fail(Errors.internal(errors.DB_ERR)),
    );

    const result = await usecase.execute({
      id: courseEntity.id,
      currentUserId: instructorId,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toBe(errors.DB_ERR);
  });
});
