import { Test, TestingModule } from '@nestjs/testing';
import { FindUserUseCase } from './find-user.usecase';
import { IUSER_REPOSITORY } from '@/module/users/domain/constants/injection.token';

describe('Find unique user', () => {
  let useCase: FindUserUseCase;
  let mockRepository: { findOne: jest.Mock<any, any, any> };

  beforeEach(async () => {
    mockRepository = { findOne: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindUserUseCase,
        {
          provide: IUSER_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();
    useCase = module.get<FindUserUseCase>(FindUserUseCase);
  });

  it('should return user with same id', async () => {
    const user = {
      id: '1',
      username: 'exampleOne',
      email: 'exampleone@email.com',
    };

    mockRepository.findOne.mockResolvedValue(user);

    const result = await useCase.execute('1');

    if (result.ok) expect(result.value).toBe(user);
    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
  });

  it('should return null if the id mismatch', async () => {
    mockRepository.findOne.mockResolvedValue({ ok: true, value: null });

    const result = await useCase.execute('4');

    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.error).toEqual({
        type: 'NOT_FOUND',
        message: 'User not found',
      });

    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
  });

  it('should return error message when connection fails', async () => {
    mockRepository.findOne.mockRejectedValue(
      new Error('Faild to load user connection issue'),
    );

    await expect(mockRepository.findOne).rejects.toThrow(
      'Faild to load user connection issue',
    );
  });
});
