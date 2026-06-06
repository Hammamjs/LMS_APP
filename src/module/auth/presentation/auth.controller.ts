import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthFacade } from '../application/auth.facade';
import { SignInDto } from './dto/sign-in.dto';
import { DomainException } from '@/core/common/domain/domain.exception';
import { SignUpDto } from './dto/sign-up.dto';
import { EmailVerification } from './dto/email-verification.dto';
import { ResendCode } from './dto/resend-code.dto';
import { ForgotPassword } from './dto/forgot-password.dto';
import { VerifyPasswordResetCode } from './dto/verify-reset-code.dto';
import { ResetPassword } from './dto/reset-password.dto';
import type { Request, Response } from 'express';
import { Errors } from '@/core/common/domain/err.utils';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { VerifyJwt } from '@/core';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { AuthCookieInterceptor } from '@/core/common/infrastructure/nest/interceptors/auth-cookie.interceptor';

@UseInterceptors(AuthCookieInterceptor)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authFacade: AuthFacade,
    private readonly config: ConfigService,
  ) {}

  @Post('signin')
  @HttpCode(200)
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  async singIn(@Body() dto: SignInDto) {
    // this return user entity / and access token
    return this.authFacade.SignIn.execute(dto);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refreshToken', {
      path: '/',
      secure: this.config.get('NODE_ENV') == 'production',
      sameSite: 'lax',
    });

    return {
      message: 'You have logged out',
    };
  }

  @Post('signup')
  async signUp(@Body() dto: SignUpDto) {
    return this.authFacade.signup.execute(dto);
  }

  @Post('verify-email')
  async EmailVerification(@Body() dto: EmailVerification) {
    console.log(dto);

    return this.authFacade.emailVerification.execute(dto);
  }

  @Post('resend-code')
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  async ResendCodeVerificaion(@Body() dto: ResendCode) {
    return this.authFacade.resendCode.execute({
      email: dto.email,
    });
  }

  @Post('forgot-password')
  async ForgotPassword(@Body() dto: ForgotPassword) {
    return this.authFacade.forgorPassword.execute(dto);
  }

  @Post('verify-resetcode')
  async VerifyPasswordResetCode(@Body() dto: VerifyPasswordResetCode) {
    return this.authFacade.verifyResetCode.execute(dto);
  }

  @Patch('reset-password')
  async resetPassword(@Body() dto: ResetPassword) {
    return this.authFacade.resetPassword.execute(dto);
  }

  @UseGuards(VerifyJwt)
  @Get('refresh')
  @HttpCode(200)
  async RefreshToken(@Req() req: Request) {
    console.log('refresh endpoint reached');
    console.log(req.cookies);

    const oldToken = req.cookies?.['refreshToken'] as string | undefined;

    if (!oldToken)
      throw new DomainException(Errors.notFound('No refresh token found'));

    return this.authFacade.refreshToken.execute(oldToken);
  }

  @Get('current-user')
  async GetProfile(@Req() req: Request) {
    const refreshToken = req.cookies.refreshToken as string;
    return this.authFacade.getProfile.execute(refreshToken);
  }

  @UseGuards(VerifyJwt)
  @Patch('update-password')
  async updatePassword(@Req() req: Request, @Body() dto: UpdatePasswordDto) {
    return this.authFacade.updatePassword.execute({ ...dto, id: req.user.id });
  }
}
