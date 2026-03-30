import { Injectable } from '@nestjs/common';
import { SignInUseCase } from './usecases/sign-in/sign-in.usecase';
import { EmailVerificationUseCase } from './usecases/email-verification/email-verification.usecase';
import { RegisterationUseCase } from './usecases/registeration/registeration.usecase';

@Injectable()
export class AuthFacade {
  constructor(
    public readonly SignIn: SignInUseCase,
    public readonly emailVerification: EmailVerificationUseCase,
    public readonly signup: RegisterationUseCase,
  ) {}
}
