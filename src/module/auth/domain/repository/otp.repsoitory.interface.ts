import { Result } from '@/core/common/domain/result.pattern';

export interface IOTPRepository {
  getResetCode: (key: string) => Promise<Result<string | null>>;
  setResetCode: (
    key: string,
    code: string,
    ttlSeconds: number,
  ) => Promise<Result<void>>;
  delResetCode: (key: string) => Promise<Result<void>>;
}
