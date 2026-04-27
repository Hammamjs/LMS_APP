import { PrismaService } from '@/core';
import {
  IUserRepository,
  UserPaginationParams,
} from '../domain/repositories/user.repository.interface';
import { User } from '../domain/entity/user.entity';
import { Injectable } from '@nestjs/common';
import { Prisma, Users as PrismaUser } from '@prisma/client';
import {
  Result,
  Errors,
  ErrorMapper,
  TransactionContext,
  PaginationResult,
  paginate,
} from '@/core';
import { MapperUser } from './mapper/user.mapper';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  private readonly _entityName = 'User';
  constructor(
    private readonly prisma: PrismaService,
    private readonly context: TransactionContext,
  ) {}

  private get _db() {
    const store = this.context.getStore();
    return store?.tx ?? this.prisma;
  }

  async findById(id: string): Promise<Result<User>> {
    try {
      if (!id) return Result.fail(Errors.validation('User id not provided'));
      const user = await this._db.users.findUnique({ where: { id } });

      if (!user) return Result.fail(Errors.notFound('User not exists'));

      return { ok: true, value: MapperUser.toDomain(user) };
    } catch (err: unknown) {
      return ErrorMapper.toResult(err, this._entityName);
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      if (!id) return Result.fail(Errors.notFound('Id is required'));

      const user = await this._db.users.delete({ where: { id } });

      if (!user) return Result.fail(Errors.notFound('User not found'));

      return Result.ok(undefined);
    } catch (err: unknown) {
      return ErrorMapper.toResult(err, this._entityName);
    }
  }

  // Combine both insert and update operation
  async save(user: User): Promise<Result<User>> {
    let data: PrismaUser;

    try {
      if (!user.isNew) {
        data = await this._db.users.update({
          data: user.toPersistence(),
          where: { id: user.getId() },
        });
      } else {
        data = await this._db.users.create({
          data: user.toPersistence(),
        });
      }

      return { ok: true, value: MapperUser.toDomain(data) };
    } catch (err: unknown) {
      return ErrorMapper.toResult(err, this._entityName);
    }
  }

  async findAll(
    params: UserPaginationParams,
  ): Promise<Result<PaginationResult<User>>> {
    const { isVerified, limit, page, role } = params;
    try {
      const where: Prisma.UsersWhereInput = {
        ...(role && { role }),
        ...(isVerified !== undefined ? { isVerified } : {}),
      };

      const paginationData = await paginate(
        { limit, page },
        (args) => this._db.users.findMany({ ...args, where }),
        (args) => this._db.users.count({ ...args, where }),
        (row) => MapperUser.toDomain(row),
      );

      return paginationData;
    } catch (err: unknown) {
      return ErrorMapper.toResult(err, this._entityName);
    }
  }

  async findByEmail(email: string): Promise<Result<User>> {
    try {
      const user = await this._db.users.findUnique({ where: { email } });
      if (!user) return Result.fail(Errors.notFound('User not found'));

      return Result.ok(MapperUser.toDomain(user));
    } catch (err: unknown) {
      return ErrorMapper.toResult(err, this._entityName);
    }
  }
}
