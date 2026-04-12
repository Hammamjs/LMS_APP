import { DomainError } from './result.pattern';

export function handleError(
  err: unknown,
  type: 'INTERNAL' | 'VALIDATION' = 'INTERNAL',
): DomainError {
  return {
    type,
    message: err instanceof Error ? err.message : 'Internal Server Error',
  };
}
