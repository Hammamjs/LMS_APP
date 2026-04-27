import { Injectable } from '@nestjs/common';
import { ICacheRepository } from '../../domain/repository/cache.repsoitory.interface';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { Result, Errors } from '@/core';

@Injectable()
export class RedisOTPRepository implements ICacheRepository {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async get(key: string): Promise<Result<string | null>> {
    try {
      const result = await this.redis.get(key);
      return Result.ok(result);
    } catch {
      return Result.fail(Errors.internal('Redis connection failed'));
    }
  }

  async set(
    key: string,
    code: string,
    ttlSeconds: number,
  ): Promise<Result<void>> {
    try {
      await this.redis.set(key, code, 'EX', ttlSeconds);
      return Result.ok(undefined);
    } catch {
      return Result.fail(Errors.internal('Redis connection failed'));
    }
  }

  async del(key: string): Promise<Result<void>> {
    try {
      await this.redis.del(key);
      return Result.ok(undefined);
    } catch {
      return Result.fail(Errors.internal('Redis connection failed'));
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
      return Result.fail(Errors.internal('Error occur'));
    }
  }
}
