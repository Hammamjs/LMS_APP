import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokenUseCase } from './refresh-token.usecase';
import { IUSER_REPOSITORY } from '@/module/users/domain/constants/injection.token';
import {
  IBCRYPT_SERVICE,
  IJWTTOKEN_SERVICE,
} from '@/module/auth/domain/constants/injection.token';
import { User } from '@/module/users/domain/entity/user.entity';
import { UserRole } from '@/module/users/domain/interface/role.interface';
import { ConfigService } from '@nestjs/config';

describe('Refresh token usecase', () => {
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

  let usecase: RefreshTokenUseCase;

  let mockBcryptService: {
    compare: jest.Mock;
    hash: jest.Mock;
  };

  let mockUserRepo: {
    findByEmail: jest.Mock;
    save: jest.Mock;
  };

  let mockTokenService: {
    generate: jest.Mock;
    verify: jest.Mock;
    generateAuthToken: jest.Mock;
  };

  let mockConfig: { getOrThrow: jest.Mock };

  beforeEach(async () => {
    mockUserRepo = {
      findByEmail: jest.fn(),
      save: jest.fn(),
    };

    mockTokenService = {
      generate: jest.fn(),
      verify: jest.fn(),
      generateAuthToken: jest.fn(),
    };

    mockBcryptService = {
      compare: jest.fn(),
      hash: jest.fn(),
    };

    mockConfig = {
      getOrThrow: jest.fn().mockReturnValue('mock-secret'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenUseCase,
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
          useValue: mockConfig,
        },
      ],
    }).compile();

    usecase = module.get<RefreshTokenUseCase>(RefreshTokenUseCase);
  });

  it('should success when user token is valid', async () => {
    const user = createUser();

    mockTokenService.verify.mockResolvedValue({
      id: user.getId(),
      email: user.getEmail(),
      role: user.getRole(),
    });

    mockUserRepo.findByEmail.mockResolvedValue({
      ok: true,
      value: user,
    });

    mockBcryptService.compare.mockResolvedValue(true);

    mockTokenService.generateAuthToken.mockResolvedValue({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    });

    mockUserRepo.save.mockResolvedValue({ ok: true });

    mockBcryptService.hash.mockResolvedValue('new-hash-token');

    const result = await usecase.execute('any-old-token');

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.value).toEqual({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      });
    }
  });

  it('should fail when hashed token and old token do not matched', async () => {
    const user = createUser();

    mockTokenService.verify.mockResolvedValue({
      id: user.getId(),
      email: user.getEmail(),
      role: user.getRole(),
    });

    mockUserRepo.findByEmail.mockResolvedValue({ ok: true, value: user });
    mockBcryptService.compare.mockResolvedValue(false);

    const result = await usecase.execute('old-token');

    expect(result.ok).toBe(false);

    expect(mockBcryptService.hash).not.toHaveBeenCalled();
    expect(mockTokenService.generateAuthToken).not.toHaveBeenCalled();

    // should be called to remove token
    expect(mockUserRepo.save).toHaveBeenCalled();
  });
});
