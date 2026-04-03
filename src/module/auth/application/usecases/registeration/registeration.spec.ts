import { createHash } from 'crypto';
import { RegisterationUseCase } from './registeration.usecase';

describe('Registeration test cases', () => {
  let useCase: RegisterationUseCase;

  const mockUserRepo = {
    findByEmail: jest.fn(),
    save: jest.fn(),
  };

  const mockBcryptService = {
    hash: jest.fn(),
  };

  const mockOTPRepo = {
    setResetCode: jest.fn(),
  };

  const mockEventPublisher = {
    publish: jest.fn(),
  };

  beforeEach(() => {
    useCase = new RegisterationUseCase(
      mockUserRepo as any,
      mockBcryptService as any,
      mockOTPRepo as any,
      mockEventPublisher as any,
    );

    jest.clearAllMocks();
  });

  it('should create new user', async () => {
    mockUserRepo.findByEmail.mockResolvedValue({ ok: false });

    jest.spyOn(Math, 'random').mockReturnValue(0.6);

    // the formula should be (100000 + 0.6 * 900000) = 640000
    const generateCode = '640000';

    // detect user id
    jest.spyOn(crypto, 'randomUUID').mockReturnValue('user-123' as any);

    const hashedCode = createHash('sha256').update(generateCode).digest('hex');

    const result = await useCase.execute({
      email: 'test@example.com',
      password: 'hashed-pass',
      username: 'test',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(mockBcryptService.hash).toHaveBeenCalledWith('hashed-pass');
      expect(mockUserRepo.save).toHaveBeenCalled();
      expect(mockEventPublisher.publish).toHaveBeenCalled();
      expect(mockOTPRepo.setResetCode).toHaveBeenCalledWith(
        `verify:user-123`,
        hashedCode,
        600,
      );
    }
  });

  it('should fail when user already exists', async () => {
    const user = {
      email: 'test@example.com',
      id: 'user-123',
      role: 'Student',
      username: 'test',
    };
    mockUserRepo.findByEmail.mockResolvedValueOnce({ ok: true, value: user });

    const result = await useCase.execute({
      email: 'test@example.com',
      password: 'hashed-pass',
      username: 'test',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toBe('Email already exists');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
