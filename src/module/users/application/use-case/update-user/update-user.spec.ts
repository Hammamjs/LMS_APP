import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUserUseCase } from './update-user.usecase';
import { UserRole } from '@/module/users/domain/interface/role.interface';
import { failure } from '@/core/common/domain/err.utils';
import { User } from '@/module/users/domain/entity/user.entity';
import { IUSER_REPOSITORY } from '@/module/users/domain/constants/injection.token';

describe('Update user test cases', () => {
  let useCase: UpdateUserUseCase;
  let mockRepository: {
    save: jest.Mock<any, any, any>;
    findById: jest.Mock<any, any, any>;
  };

  const user = {
    email: 'exampleone@email.com',
    id: '48hfjdfdkjs',
    username: 'exampleone',
    role: 'Student' as UserRole,
  };

  beforeEach(async () => {
    mockRepository = { save: jest.fn(), findById: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserUseCase,
        {
          provide: IUSER_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
  });

  it('should return updated user', async () => {
    const updateDto = {
      ...user,
      username: 'newuser',
      email: 'newuser@email.com',
    };

    const existingUser = User.rehydrate({
      id: '123',
      username: 'olduser',
      email: 'old@email.com',
      password: 'hashedpassword',
      phone: null,
      isVerified: true,
      emailVerified: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      role: UserRole.Student,
      refreshToken: null,
      isPasswordCodeVerified: false,
      passwordUpdatedAt: null,
    });

    mockRepository.findById.mockResolvedValue({
      ok: true,
      value: existingUser,
    });

    const expectedUser = existingUser
      .withUsername(updateDto.username)
      .withEmail(updateDto.email);

    mockRepository.save.mockResolvedValue({ ok: true, value: expectedUser });

    const result = await useCase.execute(updateDto);

    expect(result.ok).toBeTruthy();
    if (result.ok) {
      expect(result.value?.getUsername()).toBe(updateDto.username);
      expect(result.value?.getEmail()).toBe(updateDto.email);
    }
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should return User not found', async () => {
    mockRepository.findById.mockResolvedValue({ ok: true, value: user });

    const updatedUser = {
      ...user,
      username: 'newuser',
      email: 'newuser@email.com',
    };

    mockRepository.findById.mockResolvedValue({ ok: true, value: null });

    const result = await useCase.execute(updatedUser);

    if (!result.ok)
      expect(result.error).toEqual({
        message: 'User not found',
        type: 'NOT_FOUND',
      });
  });

  it('should return connection error', async () => {
    mockRepository.findById.mockResolvedValue(
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
