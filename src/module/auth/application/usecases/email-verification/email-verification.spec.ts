import { createHash } from 'crypto';
import { EmailVerificationUseCase } from './email-verification.usecase';
import { UserFactory } from '@/tests';

describe('Code verification test cases', () => {
  let useCase: EmailVerificationUseCase;

  const mockUserRepo = {
    findByEmail: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    generate: jest.fn(),
  };

  const mockCache = {
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
      mockCache as any,
      mockConfig as any,
    );

    jest.clearAllMocks();
  });

  const email = 'test@example.com';
  const rawCode = '123456';

  it('should verify user and return token when code is correct', async () => {
    const hashedCode = createHash('sha256').update(rawCode).digest('hex');

    const user = UserFactory.build();
    mockUserRepo.findByEmail.mockResolvedValue({
      ok: true,
      value: user,
    });

    mockCache.get.mockResolvedValue({
      ok: true,
      value: hashedCode,
    });
    mockJwtService.generate.mockResolvedValue('fake-token-gen');

    const result = await useCase.execute({ email, code: rawCode });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.value.accessToken).toBe('fake-token-gen');
      expect(result.value.user.isVerified).toBe(true);
    }
    expect(mockUserRepo.save).toHaveBeenCalled();
    expect(mockCache.del).toHaveBeenCalledWith(`verify:${user.id}`);
  });

  it('should fail when verification code expired in redis', async () => {
    const user = UserFactory.build();

    mockUserRepo.findByEmail.mockResolvedValue({ ok: true, value: user });
    mockCache.get.mockResolvedValue({
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
    const user = UserFactory.build().verify();

    mockUserRepo.findByEmail.mockResolvedValue({ ok: true, value: user });

    const result = await useCase.execute({ email, code: rawCode });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe('Email already verified');
    }
    expect(mockCache.del).not.toHaveBeenCalled();
    expect(mockUserRepo.save).not.toHaveBeenCalled();
  });
});
