import { DomainError } from '@/core/common/result.pattern';
import {
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';

export function mapDomainErrorTOHttp(error: DomainError) {
  switch (error.type) {
    case 'CONFLICT':
      return new ConflictException(error.message);
    case 'INTERNAL':
      return new InternalServerErrorException(error.message);
    case 'NOT_FOUND':
      return new NotFoundException(error.message);
    case 'VALIDATION':
      return new BadRequestException(error.message);
    case 'UNAUTHORIZED':
      return new UnauthorizedException();
  }
}
