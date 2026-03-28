import { DomainError } from '@/core/common/result.pattern';

export class DomainException extends Error {
  constructor(public error: DomainError) {
    super(error.message);
  }
}
