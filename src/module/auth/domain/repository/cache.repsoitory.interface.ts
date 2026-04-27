import { Result } from '@/core/common/domain/result.pattern';

export interface ICacheRepository {
  get: (key: string) => Promise<Result<string | null>>;
  set: (key: string, code: string, ttlSeconds: number) => Promise<Result<void>>;
  del: (key: string) => Promise<Result<void>>;
  // for idempotency key puroposes
  // we set ***NX*** to prevent duplication for same request
  setNx: (
    key: string,
    value: string,
    ttlSeconds: number,
  ) => Promise<Result<boolean>>;
}
