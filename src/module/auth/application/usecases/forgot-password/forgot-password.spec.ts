import { User } from '@/module/users/domain/entity/user.entity';
import { ForgotPasswordUseCase } from './forgot-password.usecase';
import { UserRole } from '@/module/users/domain/interface/role.interface';
import { createHash } from 'crypto';

describe('Forgot password test cases', () => {
  let useCase: ForgotPasswordUseCase;

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
      passwordUpdatedAt: null,
      ...override,
    });
  };

  const mockUserRepo = {
    findByEmail: jest.fn(),
  };

  const mockCacheRepo = {
    set: jest.fn(),
  };

  const mockEventPublisher = {
    publish: jest.fn(),
  };

  beforeEach(() => {
    useCase = new ForgotPasswordUseCase(
      mockUserRepo as any,
      mockCacheRepo as any,
      mockEventPublisher as any,
    );

    jest.clearAllMocks();
  });

  it('should return confirmation message', async () => {
    const user = createUser();

    mockUserRepo.findByEmail.mockResolvedValue({ ok: true, value: user });

    jest.spyOn(Math, 'random').mockReturnValue(0.5);

    const result = await useCase.execute({ email: 'test@example.com' });

    expect(result.ok).toBe(true);

    // With 0.5, math (100000 + 0.5 * 900000) = 550000
    const expectedCode = '550000';
    const hashedCode = createHash('sha256').update(expectedCode).digest('hex');

    if (result.ok) {
      expect(result.value).toBe('Code successfully sent to your email');
    }

    expect(mockCacheRepo.set).toHaveBeenCalledWith(
      `reset_password:${user.getId()}`,
      hashedCode,
      600,
    );
    expect(mockEventPublisher.publish).toHaveBeenCalled();
  });

  afterEach(() => {
    jest.spyOn(Math, 'random').mockRestore();
  });
});
