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
          provide: 'IUserRepository',
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
      value: expectedUsers,
    });
    const result = await useCase.execute();

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.value).toEqual(expectedUsers);
    }

    expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
  });

  it('should return empty array when no users', async () => {
    mockRepository.findAll.mockResolvedValue({ ok: true, value: [] });

    const result = await useCase.execute();

    expect(result.ok).toBe(true);

    if (result.ok) expect(result.value).toEqual([]);
  });
});
