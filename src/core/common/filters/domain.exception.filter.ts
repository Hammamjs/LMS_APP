import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { mapDomainErrorTOHttp } from './domain-error.mapper';
import { DomainException } from './domain.exception';
import { Response } from 'express';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = mapDomainErrorTOHttp(exception.error)!;
    const response = host.switchToHttp().getResponse<Response>();
    if (exception instanceof DomainException) {
      response.status(ctx.getStatus()).json(ctx.getResponse());
    }

    response.status(500).json({ ok: false, error: 'Internal Server Error' });
  }
}
