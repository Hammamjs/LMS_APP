import { Test, TestingModule } from '@nestjs/testing';
import { FindEnrollmentByCourseAndUserUseCase } from './find-enrollment-by-course_user.usecase';
import { IENROLLMENT_REPOSITORY } from '@/module/enrollment/domain/constants/token.injection';
import { Errors, Result } from '@/core';
import { EnrollmentFactory } from '@/tests';

describe('Find enrollment by course and course test cases', () => {
  let usecase: FindEnrollmentByCourseAndUserUseCase,
    mockFindEnrollmentByCourseAndUser: { findByCourseAndUser: jest.Mock };

  const errors = {
    NOT_FOUND: 'User has no enrollment',
  };

  beforeEach(async () => {
    mockFindEnrollmentByCourseAndUser = { findByCourseAndUser: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindEnrollmentByCourseAndUserUseCase,
        {
          provide: IENROLLMENT_REPOSITORY,
          useValue: mockFindEnrollmentByCourseAndUser,
        },
      ],
    }).compile();
    usecase = module.get<FindEnrollmentByCourseAndUserUseCase>(
      FindEnrollmentByCourseAndUserUseCase,
    );
  });

  it('should pass when all steps satisfied', async () => {
    const params = {
      courseId: 'valid-course-id',
      userId: 'valid-user-id',
    };

    mockFindEnrollmentByCourseAndUser.findByCourseAndUser.mockResolvedValue(
      Result.ok(EnrollmentFactory.build()),
    );

    const result = await usecase.execute(params);

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.userId).toBe(params.userId);
    expect(
      mockFindEnrollmentByCourseAndUser.findByCourseAndUser,
    ).toHaveBeenCalledTimes(1);

    expect(
      mockFindEnrollmentByCourseAndUser.findByCourseAndUser,
    ).toHaveBeenCalledWith(params.userId, params.courseId);
  });

  it('should fail when course or user not found', async () => {
    mockFindEnrollmentByCourseAndUser.findByCourseAndUser.mockResolvedValue(
      Result.fail(Errors.notFound(errors.NOT_FOUND)),
    );

    const result = await usecase.execute({
      courseId: 'valid-course-id',
      userId: 'valid-user-id',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toBe(errors.NOT_FOUND);
  });
});
