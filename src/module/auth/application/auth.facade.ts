import { Injectable } from '@nestjs/common';
import { SignInUseCase } from './usecases/sign-in/sign-in.usecase';
import { EmailVerificationUseCase } from './usecases/email-verification/email-verification.usecase';
import { RegisterationUseCase } from './usecases/registeration/registeration.usecase';
import { ResendVerificationCodeUseCase } from './usecases/resend-verification-code/resend-verification-code.usecase';
import { ForgotPasswordUseCase } from './usecases/forgot-password/forgot-password.usecase';
import { VerifyResetPasswordCodeUseCase } from './usecases/verify-reset-password-code/verify-reset-password-code.usecase';
import { ResetPasswordUseCase } from './usecases/reset-password/reset-password.usecase';
import { RefreshTokenUseCase } from './usecases/refresh-token/refresh-token.usecase';

@Injectable()
export class AuthFacade {
  constructor(
    public readonly SignIn: SignInUseCase,
    public readonly emailVerification: EmailVerificationUseCase,
    public readonly signup: RegisterationUseCase,
    public readonly resendCode: ResendVerificationCodeUseCase,
    public readonly forgorPassword: ForgotPasswordUseCase,
    public readonly verifyResetCode: VerifyResetPasswordCodeUseCase,
    public readonly resetPassword: ResetPasswordUseCase,
    public readonly refreshToken: RefreshTokenUseCase,
  ) {}
}
