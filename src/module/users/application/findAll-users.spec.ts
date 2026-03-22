import { FindAllUsers } from './findAll-users.use-case';
import { Test, TestingModule } from '@nestjs/testing';

describe('Find All users use case', () => {
  let useCase: FindAllUsers;
  let mockRepository: { findAll: jest.Mock };

  beforeEach(async () => {
    mockRepository = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllUsers,
        {
          provide: 'IUserRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();
    useCase = module.get<FindAllUsers>(FindAllUsers);
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

    mockRepository.findAll.mockResolvedValue(expectedUsers);
    const result = await useCase.execute();

    expect(result).toEqual(expectedUsers);
    expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
  });

  it('should throw an error if the repository fails', async () => {
    mockRepository.findAll.mockRejectedValue(
      new Error('Databse connection error'),
    );

    await expect(useCase.execute()).rejects.toThrow('Databse connection error');
  });
});
