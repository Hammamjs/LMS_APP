import { PrismaService } from 'src/core/database/prisma.service';
import { IUserRepository } from '../domain/repositories/user.repository.interface';
import { User } from '../domain/entity/user.entity';
import { Injectable } from '@nestjs/common';
import { users as PrismaUser } from '@prisma/client';
import { Result } from '@/core/common/domain/result.pattern';
import { handleError } from '@/core/common/domain/handleError';
import { Errors, failure } from '@/core/common/domain/err.utils';
import { MapperUser } from './mapper/user.mapper';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Result<User>> {
    try {
      if (!id) return failure(Errors.validation('User id not provided'));
      const user = await this.prisma.users.findUnique({ where: { id } });

      if (!user) return failure(Errors.notFound('User not exists'));

      return { ok: true, value: MapperUser.toDomain(user) };
    } catch (err: unknown) {
      return {
        ok: false,
        error: handleError(err),
      };
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      if (!id)
        return {
          ok: false,
          error: { type: 'VALIDATION', message: 'Id is required' },
        };
      const user = await this.prisma.users.delete({ where: { id } });

      if (!user) return failure(Errors.notFound('User not found'));

      return {
        ok: true,
        value: undefined,
      };
    } catch (err: unknown) {
      return {
        ok: false,
        error: handleError(err),
      };
    }
  }

  // Combine both insert and update operation
  async save(user: User): Promise<Result<User>> {
    let data: PrismaUser;

    try {
      if (!user.isNew) {
        data = await this.prisma.users.update({
          data: user.toPersistence(),
          where: { id: user.getId() },
        });
      } else {
        data = await this.prisma.users.create({
          data: user.toPersistence(),
        });
      }

      return { ok: true, value: MapperUser.toDomain(data) };
    } catch (err: unknown) {
      return {
        ok: false,
        error: handleError(err),
      };
    }
  }

  async findAll(params: {
    take: number;
    skip: number;
  }): Promise<Result<{ users: User[]; total: number }>> {
    try {
      const [users, total] = await Promise.all([
        this.prisma.users.findMany({
          skip: params.skip,
          take: params.take,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.users.count(),
      ]);

      return {
        ok: true,
        value: { users: users.map((user) => MapperUser.toDomain(user)), total },
      };
    } catch (err: unknown) {
      return {
        ok: false,
        error: handleError(err),
      };
    }
  }

  async findByEmail(email: string): Promise<Result<User>> {
    try {
      const user = await this.prisma.users.findUnique({ where: { email } });

      if (!user) return failure(Errors.notFound('User not found'));

      return { ok: true, value: MapperUser.toDomain(user) };
    } catch (err: unknown) {
      return {
        ok: false,
        error: handleError(err),
      };
    }
  }
}
