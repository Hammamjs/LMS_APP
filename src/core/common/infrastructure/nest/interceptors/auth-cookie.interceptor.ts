import { Result } from '@/core/common/domain';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { map, Observable } from 'rxjs';

interface ExpectedAuthPayload {
  refreshToken: string;
  accessToken: string;
  user: unknown;
}

@Injectable()
export class AuthCookieInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const res = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((result: unknown) => {
        if (
          this._isResult(result) &&
          result.ok &&
          typeof result.value === 'object' &&
          result.value !== null &&
          'refreshToken' in result.value
        ) {
          const REFRESH_COOKIE_OPTIONS = {
            httpOnly: true,
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: 'lax' as const,
            secure: process.env.NODE_ENV === 'production',
          };

          const { refreshToken, ...cleanValue } =
            result.value as ExpectedAuthPayload;

          console.log('RefreshToken', refreshToken);

          res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

          return {
            ...result,
            value: cleanValue,
          };
        }

        return result;
      }),
    );
  }

  private _isResult(obj: unknown): obj is Result<unknown> {
    return (
      obj !== null &&
      typeof obj === 'object' &&
      'ok' in obj &&
      ('value' in obj || 'error' in obj)
    );
  }
}
