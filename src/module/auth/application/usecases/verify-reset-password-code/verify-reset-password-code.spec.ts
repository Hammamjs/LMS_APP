import { Test, TestingModule } from '@nestjs/testing';
import { VerifyResetPasswordCodeUseCase } from './verify-reset-password-code.usecase';
import { IUSER_REPOSITORY } from '@/module/users/domain/constants/injection.token';
import { ICACHE_REPOSITORY } from '@/module/auth/domain/constants/injection.token';
import { User } from '@/module/users/domain/entity/user.entity';
import { UserRole } from '@/module/users/domain/interface/role.interface';
import { createHash } from 'crypto';

describe('Verify reset password test cases', () => {
  let usecase: VerifyResetPasswordCodeUseCase;
  let mockUserRepo: { findByEmail: jest.Mock; save: jest.Mock };
  let mockCacheRepo: { get: jest.Mock; del: jest.Mock };

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

  beforeEach(async () => {
    mockUserRepo = {
      findByEmail: jest.fn(),
      save: jest.fn(),
    };
    mockCacheRepo = {
      get: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerifyResetPasswordCodeUseCase,
        {
          provide: IUSER_REPOSITORY,
          useValue: mockUserRepo,
        },
        {
          provide: ICACHE_REPOSITORY,
          useValue: mockCacheRepo,
        },
      ],
    }).compile();

    usecase = module.get<VerifyResetPasswordCodeUseCase>(
      VerifyResetPasswordCodeUseCase,
    );
  });

  it('should verify reset token if they matched', async () => {
    const user = createUser();

    const rawCode = '123456';

    const expectedHash = createHash('sha256').update(rawCode).digest('hex');

    mockUserRepo.findByEmail.mockResolvedValue({ ok: true, value: user });
    mockCacheRepo.get.mockResolvedValue({
      ok: true,
      value: expectedHash,
    });

    const result = await usecase.execute({
      email: 'test@example.com',
      code: rawCode,
    });

    expect(result.ok).toBeTruthy();
    expect(mockUserRepo.save).toHaveBeenCalled();
    expect(mockCacheRepo.del).toHaveBeenCalledWith(
      `reset_password:${user.getId()}`,
    );
  });

  it('should failed when saved code did not match provided code', async () => {
    const user = createUser();
    const rawCode = '775858';
    const expectedHash = createHash('sha256').update(rawCode).digest('hex');
    mockUserRepo.findByEmail.mockResolvedValue({ ok: true, value: user });
    mockCacheRepo.get.mockResolvedValue({
      ok: true,
      value: expectedHash,
    });

    const result = await usecase.execute({
      email: 'test@example.com',
      code: '123456', // different code
    });

    expect(result.ok).toBe(false);
    expect(mockCacheRepo.del).not.toHaveBeenCalled();
    expect(mockUserRepo.save).not.toHaveBeenCalled();
  });
});
