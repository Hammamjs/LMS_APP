import { Injectable } from '@nestjs/common';
import { IOTPRepository } from '../../domain/repository/otp.repsoitory.interface';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { Result } from '@/core/common/domain/result.pattern';
import { Errors, failure } from '@/core/common/domain/err.utils';

@Injectable()
export class RedisOTPRepository implements IOTPRepository {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async getResetCode(key: string): Promise<Result<string | null>> {
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

  async setResetCode(
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

  async delResetCode(key: string): Promise<Result<void>> {
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
}
