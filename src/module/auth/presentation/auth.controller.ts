import { Controller, Post } from '@nestjs/common';
import { AuthFacade } from '../application/auth.facade';
import { SignInDto } from './dto/sign-in.dto';
import { DomainException } from '@/core/common/filters/domain.exception';

@Controller()
export class AuthController {
  constructor(private readonly authFacade: AuthFacade) {}

  @Post()
  async singIn(dto: SignInDto) {
    const result = await this.authFacade.SignIn.execute(dto);

    if (!result.ok) throw new DomainException(result.error);

    return result.value; // this return user entity / and access token
  }
}
