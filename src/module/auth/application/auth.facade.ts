import { Injectable } from '@nestjs/common';
import { SignInUseCase } from './usecase/sign-in/sign-in.usecase';

@Injectable()
export class AuthFacade {
  constructor(public readonly SignIn: SignInUseCase) {}
}
