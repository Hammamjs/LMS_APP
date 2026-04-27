import { TestingModule, Test } from '@nestjs/testing';
import { FindCourseUseCase } from './find-course.usecase';
import { ICOURSE_REPOSITORY } from '../../../domain/constants/injection.token';
import { Result } from '@/core/common/domain/result.pattern';
import { Errors } from '@/core/common/domain/err.utils';
import { CourseFactory } from '@/tests';
import { CourseMapper } from '../../mapper/course-mapper';

describe('Find course use case', () => {
  let usecase: FindCourseUseCase;
  let mockCourseRepo: { findById: jest.Mock; findBySlug: jest.Mock };

  const course = CourseFactory.build();

  beforeEach(async () => {
    mockCourseRepo = { findById: jest.fn(), findBySlug: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindCourseUseCase,
        {
          provide: ICOURSE_REPOSITORY,
          useValue: mockCourseRepo,
        },
      ],
    }).compile();

    usecase = module.get<FindCourseUseCase>(FindCourseUseCase);
  });

  it('should return course that match id', async () => {
    mockCourseRepo.findById.mockResolvedValue(Result.ok(course));

    const result = await usecase.execute({ id: 'course-id-123' });

    expect(result.ok).toBeTruthy();
    if (result.ok) {
      const expectedData = CourseMapper.toResponse(course);
      expect(result.value).toEqual(expectedData);
    }
    expect(mockCourseRepo.findById).toHaveBeenCalledTimes(1);
    expect(mockCourseRepo.findBySlug).not.toHaveBeenCalled();
  });

  it('should return course that match slug', async () => {
    mockCourseRepo.findBySlug.mockResolvedValue(Result.ok(course));

    // we ensure slug converter work as expected
    const result = await usecase.execute({ slug: 'html-course' });

    expect(result.ok).toBeTruthy();
    if (result.ok) {
      const expectedData = CourseMapper.toResponse(course);
      expect(result.value).toEqual(expectedData);
    }
    expect(mockCourseRepo.findBySlug).toHaveBeenCalledTimes(1);
    expect(mockCourseRepo.findById).not.toHaveBeenCalled();
  });

  it('should return fail result when no id or slug passed', async () => {
    const result = await usecase.execute({}); // empty object

    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.error.message).toBe('Either Course Id or Slug is required');
  });

  it('should return not found when course not found', async () => {
    mockCourseRepo.findById.mockResolvedValue(
      Result.fail(Errors.notFound('Course not found.')),
    );

    const result = await usecase.execute({ id: 'non-exisiting-id' });

    expect(result.ok).toBe(false);
  });
});
