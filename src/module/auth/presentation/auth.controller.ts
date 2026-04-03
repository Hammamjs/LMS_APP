import {
  Body,
  Controller,
  HttpCode,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AuthFacade } from '../application/auth.facade';
import { SignInDto } from './dto/sign-in.dto';
import { DomainException } from '@/core/common/filters/domain.exception';
import { SignUpDto } from './dto/sign-up.dto';
import { EmailVerification } from './dto/email-verification.dto';
import { ResendCode } from './dto/resend-code.dto';
import { AuthResponse } from './dto/auth.response';
import { ForgotPassword } from './dto/forgot-password.dto';
import { VerifyPasswordResetCode } from './dto/verify-reset-code.dto';
import { ResetPassword } from './dto/reset-password.dto';
import type { Request, Response } from 'express';
import { Errors } from '@/core/common/err.utils';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  readonly SEVEN_DAYS = 24 * 7 * 60 * 60 * 1000;
  readonly PATH = '/api/auth/refresh';

  constructor(
    private readonly authFacade: AuthFacade,
    private readonly config: ConfigService,
  ) {}

  @Post('/signin')
  @HttpCode(200)
  async singIn(
    @Body() dto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authFacade.SignIn.execute(dto);

    if (!result.ok) throw new DomainException(result.error);

    const { accessToken, refreshToken, user } = result.value;

    this._setCookie(res, refreshToken);

    // this return user entity / and access token
    return {
      user: AuthResponse.from(user),
      accessToken: accessToken,
    };
  }

  @Post('/signup')
  async signUp(@Body() dto: SignUpDto) {
    const result = await this.authFacade.signup.execute(dto);

    if (!result.ok) throw new DomainException(result.error);

    return {
      ok: true,
      value: result.value,
    };
  }

  @Post('email-verify')
  async EmailVerification(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
    @Body() dto: EmailVerification,
  ) {
    const result = await this.authFacade.emailVerification.execute(dto);

    if (!result.ok) throw new DomainException(result.error);

    const { accessToken, refreshToken, user } = result.value;

    this._setCookie(res, refreshToken);

    return {
      user: AuthResponse.from(user),
      accessToken: accessToken,
    };
  }

  @Post('resend-code')
  async ResendCodeVerificaion(@Body() dto: ResendCode) {
    const result = await this.authFacade.resendCode.execute({
      email: dto.email,
    });

    if (!result.ok) throw new DomainException(result.error);

    return {
      message: result.value,
    };
  }

  @Post('forgot-password')
  async ForgotPassword(@Body() dto: ForgotPassword) {
    const result = await this.authFacade.forgorPassword.execute(dto);

    if (!result.ok) throw new DomainException(result.error);

    return {
      message: result.value,
    };
  }

  @Post('verify-resetcode')
  async VerifyPasswordResetCode(@Body() dto: VerifyPasswordResetCode) {
    const result = await this.authFacade.verifyResetCode.execute(dto);

    if (!result.ok) throw new DomainException(result.error);

    return {
      message: result.value,
    };
  }

  @Patch('reset-password')
  async resetPassword(
    @Body() dto: ResetPassword,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authFacade.resetPassword.execute(dto);

    if (!result.ok) throw new DomainException(result.error);

    const { accessToken, refreshToken, user } = result.value;

    // set refreshToken to cookies
    this._setCookie(res, refreshToken);

    return {
      user: AuthResponse.from(user),
      accessToken: accessToken,
    };
  }

  @Post('refresh')
  @HttpCode(200)
  async RefreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const oldToken = req.cookies?.['refreshToken'] as string | undefined;

    if (!oldToken)
      throw new DomainException(Errors.notFound('No refresh token found'));

    const result = await this.authFacade.refreshToken.execute(oldToken);

    if (!result.ok) {
      res.clearCookie('refreshToken', { path: this.PATH });
      throw new DomainException(result.error);
    }

    const { accessToken, refreshToken } = result.value;

    this._setCookie(res, refreshToken);

    return { accessToken };
  }

  private _setCookie(res: Response, tokenValue: string) {
    res.cookie('refreshToken', tokenValue, {
      httpOnly: true,
      path: this.PATH,
      maxAge: this.SEVEN_DAYS,
      sameSite: 'strict',
      secure: this.config.getOrThrow<string>('NODE_ENV') === 'prod',
    });
  }
}
