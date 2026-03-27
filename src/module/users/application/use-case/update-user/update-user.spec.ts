import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUserUseCase } from './update-user.usecase';
import { UserRole } from '@/module/users/domain/interface/role.interface';
import { failure } from '@/core/common/err.utils';

describe('Update user test cases', () => {
  let useCase: UpdateUserUseCase;
  let mockRepository: {
    save: jest.Mock<any, any, any>;
    findOne: jest.Mock<any, any, any>;
  };

  const user = {
    email: 'exampleone@email.com',
    id: '48hfjdfdkjs',
    username: 'exampleone',
    role: 'Student' as UserRole,
  };

  beforeEach(async () => {
    mockRepository = { save: jest.fn(), findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserUseCase,
        {
          provide: 'IUserRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
  });

  it('should return updated user', async () => {
    const updatedUser = {
      ...user,
      username: 'newuser',
      email: 'newuser@email.com',
    };

    mockRepository.findOne.mockResolvedValue({ ok: true, value: user });

    mockRepository.save.mockResolvedValue({ ok: true, value: updatedUser });

    const result = await useCase.execute(updatedUser);

    expect(result.ok).toBeTruthy();
    if (result.ok) expect(result.value).toEqual(updatedUser);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should return User not found', async () => {
    mockRepository.findOne.mockResolvedValue({ ok: true, value: user });

    const updatedUser = {
      ...user,
      username: 'newuser',
      email: 'newuser@email.com',
    };

    mockRepository.findOne.mockResolvedValue({ ok: true, value: null });

    const result = await useCase.execute(updatedUser);

    if (!result.ok)
      expect(result.error).toEqual({
        message: 'User not found',
        type: 'NOT_FOUND',
      });
  });

  it('should return connection error', async () => {
    mockRepository.findOne.mockResolvedValue(
      failure({
        type: 'INTERNAL',
        message: 'Connection failed',
      }),
    );

    const result = await useCase.execute(user);

    expect(result.ok).toBeFalsy();

    if (!result.ok)
      expect(result.error).toEqual({
        type: 'INTERNAL',
        message: 'Connection failed',
      });
  });
});
