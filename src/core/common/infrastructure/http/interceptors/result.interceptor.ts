import { DomainException } from '@/core/common/domain/domain.exception';
import { Result } from '@/core/common/domain/result.pattern';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class ResultInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((result: unknown) => {
        if (this._isResult(result)) {
          if (!result.ok) throw new DomainException(result.error);
          return result.value;
        }
        return result;
      }),
    );
  }

  // we need custom function to decided whatever result is
  private _isResult(obj: unknown): obj is Result<unknown> {
    return (
      obj !== null &&
      typeof obj == 'object' &&
      'ok' in obj &&
      ('value' in obj || 'error' in obj)
    );
  }
}
