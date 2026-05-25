import { Test, TestingModule } from '@nestjs/testing';
import { FindCoursesUseCase } from './find-courses.usecase';
import { ICOURSE_REPOSITORY } from '../../../domain/constants/injection.token';
import { Result } from '@/core/common/domain/result.pattern';
import { CourseFactory } from '@/tests';

describe('Find Courses test cases', () => {
  let usecase: FindCoursesUseCase;
  let mockCourseRepo: { findAll: jest.Mock };

  const course = CourseFactory.build();

  beforeEach(async () => {
    mockCourseRepo = { findAll: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindCoursesUseCase,
        {
          provide: ICOURSE_REPOSITORY,
          useValue: mockCourseRepo,
        },
      ],
    }).compile();

    usecase = module.get<FindCoursesUseCase>(FindCoursesUseCase);
  });

  it('should return all courses', async () => {
    const course1 = course;
    const course2 = CourseFactory.build().withTitle('CSS Course');

    const rawCourses = [course1, course2];

    const mockRepoPayload = rawCourses.map((c) => ({
      course: c,
      instructorData: {
        id: 'test-id',
        username: 'test_instructor',
        avatar: null,
        bio: 'test bio',
      },
    }));

    mockCourseRepo.findAll.mockResolvedValue(
      Result.ok({
        data: mockRepoPayload,
        meta: { total: 2, page: 1, limit: 10, lastPage: 1 },
      }),
    );

    const result = await usecase.execute({});

    expect(result.ok).toBeTruthy();

    if (result.ok) {
      expect(result.value.data).toHaveLength(2);
      expect(result.value.data[1].title).toBe('CSS Course');
      expect(result.value.data[1].instructor?.id).toBe('test-id');
    }

    expect(mockCourseRepo.findAll).toHaveBeenCalledTimes(1);
  });

  it('should return empty array when no courses', async () => {
    const expectedOutcome = {
      data: [],
      meta: {
        hasNext: false,
        hasPrev: false,
        total: 0,
        page: 1,
        limit: 10,
      },
    };

    mockCourseRepo.findAll.mockResolvedValue(Result.ok(expectedOutcome));

    const result = await usecase.execute({});

    expect(result.ok).toBeTruthy();
    if (result.ok) expect(result.value).toEqual(expectedOutcome);
  });

  it('should pass filters to repository', async () => {
    mockCourseRepo.findAll.mockResolvedValue(
      Result.ok({
        data: [],
        meta: { total: 0, page: 1, limit: 10, lastPage: 0 },
      }),
    );

    const filters = { search: 'nestjs', category: 'Backend' };

    await usecase.execute(filters);

    expect(mockCourseRepo.findAll).toHaveBeenCalledWith(filters);
  });
});
