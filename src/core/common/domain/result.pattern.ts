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
    }
  | {
      type: 'UNAUTHORIZED';
      message: string;
    }
  | {
      type: 'FORBIDDEN';
      message: string;
    };

// Factory method
export const Result = {
  ok: <T>(value: T): Result<T> => ({ ok: true, value }),
  fail: <T>(error: DomainError): Result<T> => ({ ok: false, error }),
};
