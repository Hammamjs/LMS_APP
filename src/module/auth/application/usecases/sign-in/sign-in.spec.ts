import { User } from '@/module/users/domain/entity/user.entity';
import { SignInUseCase } from './sign-in.usecase';
import { UserRole } from '@/module/users/domain/interface/role.interface';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { IUSER_REPOSITORY } from '@/module/users/domain/constants/injection.token';
import {
  IBCRYPT_SERVICE,
  IJWTTOKEN_SERVICE,
} from '@/module/auth/domain/constants/injection.token';

describe('Sign in test cases', () => {
  let useCase: SignInUseCase;
  let userRepoMock: { findByEmail: jest.Mock; save: jest.Mock };
  let bcryptServiceMock: { compare: jest.Mock; hash: jest.Mock };
  let tokenServiceMock: { generate: jest.Mock };
  let configServiceMock: { getOrThrow: jest.Mock };

  const createMockUser = (overrides: Partial<any> = {}) => {
    return User.rehydrate({
      id: 'user-123',
      email: 'test@test.com',
      username: 'test_dev',
      role: 'STUDENT' as UserRole,
      password: 'hashed_password',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerified: null,
      phone: null,
      refreshToken: null,
      isPasswordCodeVerified: false,
      passwordUpdatedAt: null,
      ...overrides,
    });
  };

  beforeEach(async () => {
    userRepoMock = { findByEmail: jest.fn(), save: jest.fn() };
    bcryptServiceMock = { compare: jest.fn(), hash: jest.fn() };
    tokenServiceMock = { generate: jest.fn() };
    configServiceMock = { getOrThrow: jest.fn().mockReturnValue('secret') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignInUseCase,
        {
          provide: IUSER_REPOSITORY,
          useValue: userRepoMock,
        },
        {
          provide: IBCRYPT_SERVICE,
          useValue: bcryptServiceMock,
        },
        {
          provide: IJWTTOKEN_SERVICE,
          useValue: tokenServiceMock,
        },
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    useCase = module.get<SignInUseCase>(SignInUseCase);
  });

  it('should return token when credentials are valid', async () => {
    userRepoMock.findByEmail.mockResolvedValue({
      ok: true,
      value: createMockUser(),
    });
    bcryptServiceMock.compare.mockResolvedValue(true);
    tokenServiceMock.generate.mockResolvedValue('fake-jwt-token');

    const result = await useCase.execute({
      email: 'example@email.com',
      password: 'fake-pass1234',
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.value.accessToken).toBe('fake-jwt-token');
      expect(userRepoMock.save).toHaveBeenCalled();
    }
  });

  it('should return this user not found', async () => {
    userRepoMock.findByEmail.mockResolvedValue({
      ok: false,
      error: { type: 'NOT_FOUND', message: 'User not found' },
    });

    const result = await useCase.execute({
      email: 'example@e.com',
      password: 'pass2344',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toBe('User not found');
  });

  it('should fail if passwords does not match', async () => {
    userRepoMock.findByEmail.mockResolvedValue({
      ok: true,
      value: createMockUser(),
    });
    bcryptServiceMock.compare.mockResolvedValue(false);

    const result = await useCase.execute({
      email: 'example@e.com',
      password: 'pass2344',
    });

    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.error).toEqual({
        type: 'VALIDATION',
        message: 'Incorrect Email or password',
      });
  });

  it('should fail when user not verified', async () => {
    const unverifiedUser = createMockUser({ isVerified: false });

    userRepoMock.findByEmail.mockResolvedValue({
      ok: true,
      value: unverifiedUser,
    });

    const result = await useCase.execute({
      email: 'test@test.com',
      password: 'hashed_password',
    });

    expect(result.ok).toBe(false);

    if (!result.ok)
      expect(result.error).toEqual({
        type: 'VALIDATION',
        message: 'Email not verified',
      });
  });
});
