import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserUseCase } from './create-user.usecase';
import { UserRole } from '@/module/users/domain/interface/role.interface';
import { failure } from '@/core/common/err.utils';
import { IUSER_REPOSITORY } from '@/module/users/domain/constants/injection.token';
import { IBCRYPT_SERVICE } from '@/module/auth/domain/constants/injection.token';

describe('Create user test', () => {
  let useCase: CreateUserUseCase;
  let mockRepository: {
    create: jest.Mock<any, any, any>;
    findByEmail: jest.Mock;
    save: jest.Mock;
  };

  let mockBcryptService: {
    hash: jest.Mock;
  };

  const newUser = {
    username: 'example',
    email: 'exampleone@user.com',
    phone: '7488399939',
    role: 'Student' as UserRole,
    password: 'pass123',
  };

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
    };

    mockBcryptService = {
      hash: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        { provide: IUSER_REPOSITORY, useValue: mockRepository },
        { provide: IBCRYPT_SERVICE, useValue: mockBcryptService },
      ],
    }).compile();
    useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
  });

  describe('Create new user', () => {
    it('should return new user after processing the user data', async () => {
      mockRepository.findByEmail.mockResolvedValue({
        ok: true,
        value: null,
      });

      mockRepository.save.mockResolvedValue({
        ok: true,
        value: newUser,
      });
      const result = await useCase.execute(newUser);

      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toEqual(newUser);
    });
  });

  it('should return error if email is missing in request', async () => {
    const invalidData = { ...newUser, email: '' };

    const result = await useCase.execute(invalidData);

    expect(result.ok).toBe(false);

    if (!result.ok)
      expect(result.error).toEqual({
        type: 'VALIDATION',
        message: 'Email is missing',
      });
  });

  it('should throw error when repository.save fails', async () => {
    mockRepository.findByEmail.mockResolvedValue({ ok: true, value: null });
    mockRepository.save.mockResolvedValue(
      failure({
        type: 'INTERNAL',
        message: 'Failed to save new user',
      }),
    );

    const result = await useCase.execute(newUser);

    if (!result.ok)
      expect(result.error).toEqual({
        type: 'INTERNAL',
        message: 'Failed to save new user',
      });
  });
});
