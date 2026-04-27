import { DomainError } from '@/core/common/domain/result.pattern';

export class DomainException extends Error {
  constructor(public error: DomainError) {
    super(error.message);
  }
}
