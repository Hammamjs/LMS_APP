export type Result<T> =
 | { ok: true; value: T }
 | { ok: false; error: DomainError };

export type DomainError =
 | {
  type: 'NOT_FOUND';
  message: string;
 }
 | {
  type: 'VALIDATION';
  message: string;
 }
 | {
  type: 'CONFLICT';
  message: string;
 }
 | {
  type: 'INTERNAL';
  message: string;
 };
