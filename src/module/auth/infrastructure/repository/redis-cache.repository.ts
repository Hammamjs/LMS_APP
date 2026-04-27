import { Injectable } from '@nestjs/common';
import { ICacheRepository } from '../../domain/repository/cache.repsoitory.interface';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { Result } from '@/core/common/domain/result.pattern';
import { Errors, failure } from '@/core/common/domain/err.utils';

@Injectable()
export class RedisCacheRepository implements ICacheRepository {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async get(key: string): Promise<Result<string | null>> {
    try {
      const result = await this.redis.get(key);
      return {
        ok: true,
        value: result,
      };
    } catch {
      return failure(Errors.internal('Redis connection failed'));
    }
  }

  async set(
    key: string,
    code: string,
    ttlSeconds: number,
  ): Promise<Result<void>> {
    try {
      await this.redis.set(key, code, 'EX', ttlSeconds);
      return {
        ok: true,
        value: undefined,
      };
    } catch {
      return failure(Errors.internal('Redis connection failed'));
    }
  }

  async del(key: string): Promise<Result<void>> {
    try {
      await this.redis.del(key);
      return {
        ok: true,
        value: undefined,
      };
    } catch {
      return failure(Errors.internal('Redis connection failed'));
    }
  }

  async setNx(
    key: string,
    value: string,
    ttlSeconds: number,
  ): Promise<Result<boolean>> {
    try {
      const result = await this.redis.set(key, value, 'EX', ttlSeconds, 'NX');

      return Result.ok(result == 'OK');
    } catch {
      return failure(Errors.internal('Redis failed to save'));
    }
  }
}
