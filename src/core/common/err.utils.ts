import { DomainError, Result } from './result.pattern';

export const Errors = {
  notFound: (message: string): DomainError => ({
    type: 'NOT_FOUND',
    message,
  }),

  validation: (message: string): DomainError => ({
    type: 'VALIDATION',
    message,
  }),

  conflict: (message: string): DomainError => ({
    type: 'CONFLICT',
    message,
  }),
  internal: (message: string): DomainError => ({
    type: 'INTERNAL',
    message,
  }),
  unauthroized: (message: string): DomainError => ({
    type: 'UNAUTHORIZED',
    message,
  }),
};

export function failure(error: DomainError): Result<never> {
  return { ok: false, error };
}
