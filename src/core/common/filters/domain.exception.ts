import { DomainError } from '@/core';

export class DomainException extends Error {
  constructor(public error: DomainError) {
    super(error.message);
  }
}
