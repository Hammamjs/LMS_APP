import { Test, TestingModule } from '@nestjs/testing';
import { FindEnrollmentByUserIdUseCase } from './find-enrollment-by-user.usecase';
import { IENROLLMENT_REPOSITORY } from '@/module/enrollment/domain/constants/token.injection';
import { Errors, Result } from '@/core';

describe('Find enrollment by id test cases', () => {
  let usecase: FindEnrollmentByUserIdUseCase,
    mockFindEnrollmentByUserId: { findByUser: jest.Mock };

  const errors = {
    NOT_FOUND: 'User not found',
  };

  beforeEach(async () => {
    mockFindEnrollmentByUserId = { findByUser: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindEnrollmentByUserIdUseCase,
        {
          provide: IENROLLMENT_REPOSITORY,
          useValue: mockFindEnrollmentByUserId,
        },
      ],
    }).compile();

    usecase = module.get<FindEnrollmentByUserIdUseCase>(
      FindEnrollmentByUserIdUseCase,
    );
  });

  it('should pass when logic satisfied', async () => {
    mockFindEnrollmentByUserId.findByUser.mockResolvedValue(
      Result.ok({
        data: [],
        meta: {},
      }),
    );

    const result = await usecase.execute('valid-user-id');

    expect(result.ok).toBeTruthy();
  });

  it('should be fail when user not enrolled to the course', async () => {
    mockFindEnrollmentByUserId.findByUser.mockResolvedValue(
      Result.fail(Errors.notFound(errors.NOT_FOUND)),
    );

    const result = await usecase.execute('non-existing-id');

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toBe(errors.NOT_FOUND);
  });
});
