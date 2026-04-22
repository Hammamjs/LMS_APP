import { User } from '@/module/users/domain/entity/user.entity';
import { ResendVerificationCodeUseCase } from './resend-verification-code.usecase';
import { UserRole } from '@/module/users/domain/interface/role.interface';
import { createHash } from 'crypto';
import { Errors } from '@/core/common/domain/err.utils';

describe('Resend Code verification test cases', () => {
  let usecase: ResendVerificationCodeUseCase;

  const mockUserRepo = {
    findByEmail: jest.fn(),
  };

  const mockEventPublisher = {
    publish: jest.fn(),
  };

  const mockCacheRepo = {
    set: jest.fn(),
  };

  beforeEach(() => {
    usecase = new ResendVerificationCodeUseCase(
      mockUserRepo as any,
      mockCacheRepo as any,
      mockEventPublisher as any,
    );

    jest.clearAllMocks();
  });

  const user = User.rehydrate({
    email: 'test@example.com',
    username: 'mr.test',
    role: 'Student' as UserRole,
    id: 'id-123',
    isVerified: false,
    isPasswordCodeVerified: false,
    emailVerified: null,
    password: 'hashed-password',
    passwordUpdatedAt: null,
    refreshToken: 'random-refresh-token',
    phone: '84784738473',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  it('should return message to verify account', async () => {
    mockUserRepo.findByEmail.mockResolvedValue({ ok: true, value: user });

    // we need id to be more predictable to make test successed
    jest.spyOn(crypto, 'randomUUID').mockReturnValue('id-123' as any);

    // we need to simulate creating new code
    // when this suppose to return .3 so our formula will be
    // (100000 + 0.3 * 900000) = 370000
    jest.spyOn(Math, 'random').mockReturnValue(0.3);

    const result = await usecase.execute({ email: 'test@example.com' });

    // or formula
    const fakeCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashingCode = createHash('sha256').update(fakeCode).digest('hex');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe('Verification code was sent.');
    }

    expect(mockEventPublisher.publish).toHaveBeenCalled();
    expect(mockCacheRepo.set).toHaveBeenCalledWith(
      `verify:${user.getId()}`,
      hashingCode,
      600,
    );
  });

  it('should exit earlier when user already verified', async () => {
    const verifiedUser = user.verify();
    mockUserRepo.findByEmail.mockResolvedValue({
      ok: true,
      value: verifiedUser,
    });

    const result = await usecase.execute({ email: 'test@example.com' });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toEqual(Errors.validation('Email already verified'));
    }
    expect(mockUserRepo.findByEmail).toHaveBeenCalledTimes(1);
    expect(mockCacheRepo.set).not.toHaveBeenCalled();
    expect(mockEventPublisher.publish).not.toHaveBeenCalled();
  });
});
