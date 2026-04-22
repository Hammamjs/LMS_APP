import { IUSER_REPOSITORY } from '@/module/users/domain/constants/injection.token';
import { FindAllUsersUseCase } from './find-all-users.use-case';
import { Test, TestingModule } from '@nestjs/testing';
import { Result } from '@/core';
import { UserFactory } from '@/tests';

describe('Find All users use case', () => {
  let useCase: FindAllUsersUseCase;
  let mockRepository: { findAll: jest.Mock };

  beforeEach(async () => {
    mockRepository = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllUsersUseCase,
        {
          provide: IUSER_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();
    useCase = module.get<FindAllUsersUseCase>(FindAllUsersUseCase);
  });

  it('should return array of users from repository', async () => {
    const user1 = UserFactory.build();
    const user2 = UserFactory.build();
    const expectedData = [user1, user2];

    mockRepository.findAll.mockResolvedValue(
      Result.ok({
        data: expectedData,
        meta: {
          page: 2,
          total: 20,
          lastPage: 2,
        },
      }),
    );
    const result = await useCase.execute({ isVerified: true });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.value.meta.page).toBe(2);
      expect(result.value.meta.total).toBe(20);
      expect(result.value.meta.lastPage).toBe(2);

      expect(mockRepository.findAll).toHaveBeenCalledWith({
        isVerified: true,
      });
    }

    expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
  });

  it('should return empty array when no users', async () => {
    mockRepository.findAll.mockResolvedValue(
      Result.ok({
        data: [],
        meta: {},
      }),
    );

    const result = await useCase.execute({ isVerified: true });

    expect(result.ok).toBe(true);

    if (result.ok) expect(result.value.data).toEqual([]);
    expect(mockRepository.findAll).toHaveBeenLastCalledWith({
      isVerified: true,
    });
  });
});
