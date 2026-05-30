import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { mapDomainErrorTOHttp } from './domain-error.mapper';
import { DomainException } from '../../../domain/domain.exception';
import { Response } from 'express';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const httpEx = mapDomainErrorTOHttp(exception.error);
    const response = host.switchToHttp().getResponse<Response>();

    response.status(httpEx.getStatus()).json(httpEx.getResponse());
  }
}
