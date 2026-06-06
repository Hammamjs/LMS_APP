import { Test, TestingModule } from '@nestjs/testing';
import { UpdateCourseUseCase } from './update-course.usecase';
import { ICOURSE_REPOSITORY } from '../../../domain/constants/injection.token';
import { Result } from '@/core/common/domain/result.pattern';
import { Errors } from '@/core/common/domain/err.utils';
import { CourseFactory } from '@/tests';
import { CourseMapper } from '../../mapper/course-mapper';

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

  beforeEach(async () => {
    mockCourseRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateCourseUseCase,
        {
          provide: ICOURSE_REPOSITORY,
          useValue: mockCourseRepo,
        },
      ],
    }).compile();

    usecase = module.get<UpdateCourseUseCase>(UpdateCourseUseCase);
  });

  it('should update course when id and data are valid', async () => {
    const existingCourse = CourseFactory.build({ title: 'Old Title' });
    const updatedCourse = existingCourse.withTitle('Advanced javascript');

    // 💡 THE FIX: Mock findById to return the correct structural shape
    mockCourseRepo.findById.mockResolvedValue(
      Result.ok({
        course: existingCourse,
        instructorData: {
          id: existingCourse.instructorId,
          username: 'instructor_1',
          avatar: null,
          bio: null,
        },
      }),
    );

    mockCourseRepo.findBySlug.mockResolvedValue(
      Result.fail(Errors.notFound(errors.TITLE_NOT_FOUND)),
    );
    mockCourseRepo.save.mockResolvedValue(Result.ok(updatedCourse));

    const result = await usecase.execute({
      id: existingCourse.id,
      category: 'Web development',
      userId: existingCourse.instructorId,
      title: 'Advanced javascript', // Pass title to trigger slug difference checks
    });

    const expectedData = CourseMapper.toResponse(updatedCourse);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual(expectedData);
    }
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
    expect(mockCourseRepo.findBySlug).not.toHaveBeenCalled();
    expect(mockCourseRepo.save).not.toHaveBeenCalled();
  });

  it('should fail when conflict occur', async () => {
    const testCourse = CourseFactory.build({ title: 'Old Title' });
    const conflictingCourse = CourseFactory.build({ title: 'Css3' });

    mockCourseRepo.findById.mockResolvedValue(
      Result.ok({
        course: testCourse,
        instructorData: {
          id: testCourse.instructorId,
          username: 'instructor_1',
          avatar: null,
          bio: null,
        },
      }),
    );

    mockCourseRepo.findBySlug.mockResolvedValue(
      Result.ok({
        course: conflictingCourse,
        instructorData: {
          id: conflictingCourse.instructorId,
          username: 'instructor_2',
          avatar: null,
          bio: null,
        },
      }),
    );

    const result = await usecase.execute({
      id: testCourse.id,
      title: 'Css3',
      userId: testCourse.instructorId,
    });

    expect(result.ok).toBe(false);
    expect(mockCourseRepo.save).not.toHaveBeenCalled();
  });

  it('should fail when someone try to update course and his not have permission', async () => {
    const testCourse = CourseFactory.build();

    mockCourseRepo.findById.mockResolvedValue(
      Result.ok({
        course: testCourse,
        instructorData: {
          id: testCourse.instructorId,
          username: 'owner',
          avatar: null,
          bio: null,
        },
      }),
    );

    const result = await usecase.execute({
      id: testCourse.id,
      userId: 'different-id',
      category: 'new title',
    });

    expect(result.ok).toBe(false);
    expect(mockCourseRepo.save).not.toHaveBeenCalled();
  });

  it('should return message when saving update failed', async () => {
    const testCourse = CourseFactory.build();

    mockCourseRepo.findById.mockResolvedValue(
      Result.ok({
        course: testCourse,
        instructorData: {
          id: testCourse.instructorId,
          username: 'owner',
          avatar: null,
          bio: null,
        },
      }),
    );
    mockCourseRepo.findBySlug.mockResolvedValue(
      Result.fail(Errors.notFound(errors.TITLE_NOT_FOUND)),
    );
    mockCourseRepo.save.mockResolvedValue(
      Result.fail(Errors.internal(errors.DB_ERR)),
    );

    const result = await usecase.execute({
      id: testCourse.id,
      category: 'new cat',
      userId: testCourse.instructorId,
    });

    expect(result.ok).toBe(false);
    if (Result.isFail(result)) expect(result.error.message).toBe(errors.DB_ERR);
  });
});
