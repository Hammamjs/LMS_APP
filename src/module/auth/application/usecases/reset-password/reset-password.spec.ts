import { Test, TestingModule } from '@nestjs/testing';
import { ResetPasswordUseCase } from './reset-password.usecase';
import { IUSER_REPOSITORY } from '@/module/users/domain/constants/injection.token';
import {
  IBCRYPT_SERVICE,
  IJWTTOKEN_SERVICE,
} from '@/module/auth/domain/constants/injection.token';
import { ConfigService } from '@nestjs/config';
import { User } from '@/module/users/domain/entity/user.entity';
import { UserRole } from '@/module/users/domain/interface/role.interface';

describe('Reset password test cases', () => {
  const createUser = (override?: Partial<any>) => {
    return User.rehydrate({
      email: 'test@example.com',
      username: 'test',
      id: 'user-123',
      isPasswordCodeVerified: false,
      password: 'hashed-pass',
      emailVerified: null,
      isVerified: true,
      passwordUpdatedAt: null,
      phone: null,
      refreshToken: 'some-token',
      role: 'Studen' as UserRole,
      updatedAt: new Date(),
      createdAt: new Date(),
      ...override,
    });
  };

  let usecase: ResetPasswordUseCase;

  let mockUserRepo: { findByEmail: jest.Mock; save: jest.Mock };
  let mockBcryptService: { hash: jest.Mock };
  let mockTokenService: { generate: jest.Mock; generateAuthToken: jest.Mock };
  let mockConfigService: { getOrThrow: jest.Mock };

  beforeEach(async () => {
    mockUserRepo = {
      findByEmail: jest.fn(),
      save: jest.fn(),
    };
    mockBcryptService = {
      hash: jest.fn(),
    };
    mockTokenService = {
      generate: jest.fn(),
      generateAuthToken: jest.fn(),
    };
    mockConfigService = {
      getOrThrow: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResetPasswordUseCase,
        {
          provide: IUSER_REPOSITORY,
          useValue: mockUserRepo,
        },
        {
          provide: IBCRYPT_SERVICE,
          useValue: mockBcryptService,
        },
        {
          provide: IJWTTOKEN_SERVICE,
          useValue: mockTokenService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    usecase = module.get<ResetPasswordUseCase>(ResetPasswordUseCase);
  });

  it('should success if password verified', async () => {
    const user = createUser({ isPasswordCodeVerified: true });

    mockUserRepo.findByEmail.mockResolvedValue({ ok: true, value: user });

    mockBcryptService.hash.mockResolvedValue('hashing-string');
    mockTokenService.generateAuthToken.mockResolvedValue({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    });

    const result = await usecase.execute({
      email: 'test@example.com',
      newPassword: 'new-pass',
      confirmPassword: 'new-pass',
    });

    expect(mockBcryptService.hash).toHaveBeenCalledTimes(2);

    expect(result.ok).toBeTruthy();
    expect(mockUserRepo.save).toHaveBeenCalledTimes(1);
    expect(mockTokenService.generateAuthToken).toHaveBeenCalledTimes(1);
  });

  it('should failed when user not veriified', async () => {
    const user = createUser();

    mockUserRepo.findByEmail.mockResolvedValue({ ok: true, value: user });

    const result = await usecase.execute({
      email: 'test@example.com',
      newPassword: 'new-pass',
      confirmPassword: 'new-pass',
    });

    expect(result.ok).toBe(false);
    expect(mockUserRepo.save).not.toHaveBeenCalled();
    expect(mockTokenService.generateAuthToken).not.toHaveBeenCalled();
    expect(mockBcryptService.hash).not.toHaveBeenCalled();
  });
});
