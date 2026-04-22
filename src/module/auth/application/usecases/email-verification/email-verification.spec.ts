import { createHash } from 'crypto';
import { EmailVerificationUseCase } from './email-verification.usecase';
import { User } from '@/module/users/domain/entity/user.entity';
import { UserRole } from '@/module/users/domain/interface/role.interface';

describe('Code verification test cases', () => {
  let useCase: EmailVerificationUseCase;

  const mockUserRepo = {
    findByEmail: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    generate: jest.fn(),
  };

  const mockCacheRepo = {
    get: jest.fn(),
    del: jest.fn(),
  };

  const mockConfig = {
    getOrThrow: (key: any) => `mock-${key}`,
  };

  beforeEach(() => {
    useCase = new EmailVerificationUseCase(
      mockUserRepo as any,
      mockJwtService as any,
      mockCacheRepo as any,
      mockConfig as any,
    );

    jest.clearAllMocks();
  });

  const createUser = (override?: Partial<any>) => {
    return User.rehydrate({
      id: 'user-123',
      email: 'test@example.com',
      username: 'testuser',
      role: 'Student' as UserRole,
      isVerified: false,
      password: 'hashed-password',
      phone: null,
      emailVerified: null,
      refreshToken: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPasswordCodeVerified: false,
      passwordUpdatedAt: new Date(),
      ...override,
    });
  };

  const email = 'test@example.com';
  const rawCode = '123456';

  it('should verify user and return token when code is correct', async () => {
    const hashedCode = createHash('sha256').update(rawCode).digest('hex');

    const user = createUser();
    mockUserRepo.findByEmail.mockResolvedValue({
      ok: true,
      value: user,
    });

    mockCacheRepo.get.mockResolvedValue({
      ok: true,
      value: hashedCode,
    });
    mockJwtService.generate.mockResolvedValue('fake-token-gen');

    const result = await useCase.execute({ email, code: rawCode });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.value.accessToken).toBe('fake-token-gen');
      expect(result.value.user.getIsVerified()).toBe(true);
    }
    expect(mockUserRepo.save).toHaveBeenCalled();
    expect(mockCacheRepo.del).toHaveBeenCalledWith(`verify:${user.getId()}`);
  });

  it('should fail when verification code expired in redis', async () => {
    const user = createUser();

    mockUserRepo.findByEmail.mockResolvedValue({ ok: true, value: user });
    mockCacheRepo.get.mockResolvedValue({
      ok: true,
      value: null,
    });

    const result = await useCase.execute({ email, code: rawCode });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe(
        'Verification code has expired or was never sent',
      );
    }

    // this part of code should't be invoked
    expect(mockJwtService.generate).not.toHaveBeenCalled();
    expect(mockUserRepo.save).not.toHaveBeenCalled();
  });

  it('should return early when user already verified', async () => {
    const user = createUser().verify();

    mockUserRepo.findByEmail.mockResolvedValue({ ok: true, value: user });

    const result = await useCase.execute({ email, code: rawCode });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe('Email already verified');
    }
    expect(mockCacheRepo.del).not.toHaveBeenCalled();
    expect(mockUserRepo.save).not.toHaveBeenCalled();
  });
});
