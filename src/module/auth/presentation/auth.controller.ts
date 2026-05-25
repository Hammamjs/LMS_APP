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
} from '@nestjs/common';
import { AuthFacade } from '../application/auth.facade';
import { SignInDto } from './dto/sign-in.dto';
import { DomainException } from '@/core/common/domain/domain.exception';
import { SignUpDto } from './dto/sign-up.dto';
import { EmailVerification } from './dto/email-verification.dto';
import { ResendCode } from './dto/resend-code.dto';
import { AuthResponse } from './dto/auth.response';
import { ForgotPassword } from './dto/forgot-password.dto';
import { VerifyPasswordResetCode } from './dto/verify-reset-code.dto';
import { ResetPassword } from './dto/reset-password.dto';
import type { Request, Response } from 'express';
import { Errors } from '@/core/common/domain/err.utils';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { VerifyJwt } from '@/core';
import { JwtPayload } from '../domain/service/token.service.interface';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('auth')
export class AuthController {
  readonly SEVEN_DAYS = 24 * 7 * 60 * 60 * 1000;
  readonly PATH = '/';

  constructor(
    private readonly authFacade: AuthFacade,
    private readonly config: ConfigService,
  ) {}

  @Post('signin')
  @HttpCode(200)
  @Throttle({ default: { ttl: 60000, limit: 3 } })
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

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refreshToken', {
      path: this.PATH,
      secure: this.config.get('NODE_ENV') == 'pros',
      sameSite: 'lax',
    });

    return {
      message: 'You have logged out',
    };
  }

  @Post('signup')
  async signUp(@Body() dto: SignUpDto) {
    const result = await this.authFacade.signup.execute(dto);

    if (!result.ok) throw new DomainException(result.error);

    return {
      ok: true,
      value: result.value,
    };
  }

  @Post('verify-email')
  async EmailVerification(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: EmailVerification,
  ) {
    console.log(dto);

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
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  async ResendCodeVerificaion(@Body() dto: ResendCode) {
    console.log('Resend hitted');
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

  @UseGuards(VerifyJwt)
  @Get('refresh')
  @HttpCode(200)
  async RefreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const oldToken = req.cookies?.['refreshToken'] as string | undefined;

    console.log('Old refreshToken', oldToken);

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

  @Get('current-user')
  async GetProfile(@Req() req: Request) {
    const cookie = req.cookies;
    console.log(cookie);
    if (!cookie?.refreshToken) throw new Error('Token not found');
    const token = cookie.refreshToken as string;

    return await this.authFacade.getProfile.execute(token);
  }

  @UseGuards(VerifyJwt)
  @Patch('update-password')
  async updatePassword(@Req() req: Request, @Body() dto: UpdatePasswordDto) {
    const { id } = req['user'] as JwtPayload;
    return await this.authFacade.updatePassword.execute({ ...dto, id });
  }

  private _setCookie(res: Response, tokenValue: string) {
    res.cookie('refreshToken', tokenValue, {
      httpOnly: true,
      path: this.PATH,
      maxAge: this.SEVEN_DAYS,
      sameSite: 'lax',
      secure: this.config.getOrThrow<string>('NODE_ENV') === 'prod',
    });
  }
}
