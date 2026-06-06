import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserUseCase } from './create-user.usecase';
import { Errors } from '@/core/common/domain/err.utils';
import { IUSER_REPOSITORY } from '@/module/users/domain/constants/injection.token';
import { IBCRYPT_SERVICE } from '@/module/auth/domain/constants/injection.token';
import { UserFactory } from '@/tests';
import { UserRole } from '@/module/users/domain/interface';
import { Result } from '@/core';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;

  let mockRepository: {
    create: jest.Mock;
    findByEmail: jest.Mock;
    save: jest.Mock;
  };

  let mockBcryptService: {
    hash: jest.Mock;
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
        {
          provide: IUSER_REPOSITORY,
          useValue: mockRepository,
        },
        {
          provide: IBCRYPT_SERVICE,
          useValue: mockBcryptService,
        },
      ],
    }).compile();

    useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
  });

  describe('execute', () => {
    it('should create a new user successfully', async () => {
      const newUser = UserFactory.build();

      mockRepository.findByEmail.mockResolvedValue({
        ok: true,
        value: null,
      });

      mockBcryptService.hash.mockResolvedValue('hashed-pass');

      mockRepository.create.mockReturnValue(newUser);

      mockRepository.save.mockResolvedValue({
        ok: true,
        value: newUser,
      });

      const result = await useCase.execute({
        email: newUser.email,
        password: 'plain-password',
        role: newUser.role,
        username: newUser.username,
        phone: null,
        avatar: '',
        bio: '',
      });

      expect(result.ok).toBe(true);

      if (result.ok) {
        expect(result.value.username).toBe(newUser.username);
      }

      expect(mockRepository.findByEmail).toHaveBeenCalled();
      expect(mockBcryptService.hash).toHaveBeenCalledWith('plain-password');
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should return validation error if email is missing', async () => {
      const result = await useCase.execute({
        email: '',
        password: 'password',
        role: UserRole.Student,
        username: 'john',
        phone: null,
        avatar: '',
        bio: '',
      });

      expect(result.ok).toBe(false);

      if (Result.isFail(result)) {
        expect(result.error).toEqual(Errors.validation('Email is missing'));
      }
    });

    it('should return error when repository.save fails', async () => {
      const newUser = UserFactory.build();

      mockRepository.findByEmail.mockResolvedValue({
        ok: true,
        value: null,
      });

      mockBcryptService.hash.mockResolvedValue('hashed-pass');

      mockRepository.create.mockReturnValue(newUser);

      mockRepository.save.mockResolvedValue(
        Result.fail(Errors.validation('Failed to save new user')),
      );

      const result = await useCase.execute({
        email: newUser.email,
        password: 'plain-password',
        role: newUser.role,
        username: newUser.username,
        phone: null,
        avatar: '',
        bio: '',
      });

      expect(result.ok).toBe(false);

      if (Result.isFail(result)) {
        expect(result.error).toEqual(
          Errors.validation('Failed to save new user'),
        );
      }
    });
  });
});
