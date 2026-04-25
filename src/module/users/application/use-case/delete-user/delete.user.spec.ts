import { Test, TestingModule } from '@nestjs/testing';
import { DeleteUserUseCase } from './delete-user.usecase';
import { failure } from '@/core/common/err.utils';
import { IUSER_REPOSITORY } from '@/module/users/domain/constants/injection.token';

describe('Delet user test cases', () => {
  let useCase: DeleteUserUseCase;
  let mockRepository: { delete: jest.Mock };

  const user = {
    id: '1',
    email: 'exampleone',
    username: 'example',
  };

  beforeEach(async () => {
    mockRepository = { delete: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteUserUseCase,
        {
          provide: IUSER_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();
    useCase = module.get<DeleteUserUseCase>(DeleteUserUseCase);
  });

  it('should return user after deletion', async () => {
    mockRepository.delete.mockResolvedValue(user);

    const result = await useCase.execute('1');

    if (result.ok) expect(result.value).toEqual(user);
  });

  it('should return null if user not exists', async () => {
    mockRepository.delete.mockResolvedValue({ ok: true, value: null });

    const result = await useCase.execute('1');

    expect(result.ok).toBe(true);
    if (!result.ok) expect(result.error.message).toBe('User not exists');
  });

  it('should called with id params', async () => {
    mockRepository.delete.mockResolvedValue({ ok: true, value: user });
    await useCase.execute('1');
    expect(mockRepository.delete).toHaveBeenCalledWith('1');

    expect(mockRepository.delete).toHaveBeenCalledTimes(1);
  });

  it('should throw error when connection fails', async () => {
    mockRepository.delete.mockResolvedValue(
      failure({
        type: 'INTERNAL',
        message: 'Database connection failed',
      }),
    );

    const result = await useCase.execute('1');

    if (!result.ok)
      expect(result.error).toEqual({
        type: 'INTERNAL',
        message: 'Database connection failed',
      });
  });
});
