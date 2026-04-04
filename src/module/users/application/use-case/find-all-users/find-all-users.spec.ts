import { IUSER_REPOSITORY } from '@/module/users/domain/constants/injection.token';
import { FindAllUsersUseCase } from './find-all-users.use-case';
import { Test, TestingModule } from '@nestjs/testing';

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
    const expectedUsers = [
      {
        id: '1',
        email: 'exampleone@gmail.com',
        username: 'example One',
      },
      {
        id: '2',
        email: 'exampletwo@gmail.com',
        username: 'example Two',
      },
    ];

    mockRepository.findAll.mockResolvedValue({
      ok: true,
      value: {
        users: expectedUsers,
        total: 20,
      },
    });
    const result = await useCase.execute({ page: 2, limit: 10 });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.value.data).toEqual(expectedUsers);
      expect(result.value.meta.page).toBe(2);
      expect(result.value.meta.total).toBe(20);
      expect(result.value.meta.lastPage).toBe(2);

      expect(mockRepository.findAll).toHaveBeenCalledWith({
        skip: 10,
        take: 10,
      });
    }

    expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
  });

  it('should return empty array when no users', async () => {
    mockRepository.findAll.mockResolvedValue({
      ok: true,
      value: {
        users: [],
        total: 10,
      },
    });

    const result = await useCase.execute({ page: 1, limit: 10 });

    expect(result.ok).toBe(true);

    if (result.ok) expect(result.value.data).toEqual([]);
    expect(mockRepository.findAll).toHaveBeenLastCalledWith({
      take: 10,
      skip: 0,
    });
  });
});
