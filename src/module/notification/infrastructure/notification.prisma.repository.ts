import { Injectable } from '@nestjs/common';
import { INotificationSystemRepository } from '../domain/repository/notification.repository.interface';
import {
  ErrorMapper,
  Errors,
  paginate,
  PaginationResult,
  PrismaService,
  Result,
} from '@/core';
import { TransactionContext } from '@/core/common/infrastructure/http/transaction/transaction.context';
import { NotificationPaginationResult } from '../domain/entity/notification.type';
import { Prisma } from '@prisma/client';
import { NotificationMapper } from './mapper/notification.mapper';
import { Notification } from '../domain/entity/notification.entity';
import { Notification as PrismaNotification } from '@prisma/client';

@Injectable()
export class NotificationPrismaRepository implements INotificationSystemRepository {
  private readonly _entityName = 'Notification';
  constructor(
    private readonly prisma: PrismaService,
    private readonly context: TransactionContext,
  ) {}

  private get _db() {
    const store = this.context.getStore();
    return store?.tx || this.prisma;
  }

  async findAll(
    params: NotificationPaginationResult,
  ): Promise<Result<PaginationResult<Notification>>> {
    try {
      const { userId, page, limit } = params;
      const where: Prisma.NotificationWhereInput = {
        ...(userId && { userId }),
        isDeleted: false,
      };

      const paginateData = paginate(
        { limit, page },
        (args) =>
          this._db.notification.findMany({
            ...args,
            where,
            orderBy: { createdAt: 'desc' },
          }),
        (args) => this._db.notification.count({ ...args, where }),
        (row) => NotificationMapper.toDomain(row),
      );

      return paginateData;
    } catch (err: unknown) {
      return ErrorMapper.toResult(err, this._entityName);
    }
  }

  async findById(id: string): Promise<Result<Notification>> {
    try {
      const result = await this._db.notification.findUnique({ where: { id } });

      if (!result)
        return Result.fail(Errors.notFound('Notification not exists'));

      const toDomain = NotificationMapper.toDomain(result);
      return Result.ok(toDomain);
    } catch (err) {
      return ErrorMapper.toResult(err, this._entityName);
    }
  }

  async markAllAsRead(ids: string[]): Promise<Result<void>> {
    try {
      const result = await this._db.notification.updateManyAndReturn({
        where: {
          id: {
            in: ids,
          },
        },
        data: { read: true },
      });

      if (!result) return Result.fail(Errors.internal('Fail to update data'));

      return Result.ok(undefined);
    } catch (err) {
      return ErrorMapper.toResult(err, this._entityName);
    }
  }

  async saveMany(notifications: Notification[]): Promise<Result<void>> {
    try {
      const manyRecord = notifications.map((n) => n.toPersistence());
      const result = await this._db.notification.createMany({
        data: manyRecord,
      });

      if (result.count <= 0)
        return Result.fail(Errors.internal('Update records failed'));

      return Result.ok(undefined);
    } catch (err) {
      return ErrorMapper.toResult(err, this._entityName);
    }
  }

  async save(notification: Notification): Promise<Result<Notification>> {
    try {
      const data: PrismaNotification = await this._db.notification.upsert({
        where: { id: notification.getId },
        create: notification.toPersistence(),
        update: notification.toPersistence(),
      });

      const toDomain = NotificationMapper.toDomain(data);

      return Result.ok(toDomain);
    } catch (err) {
      return ErrorMapper.toResult(err, this._entityName);
    }
  }

  async deleteAll(ids: string[]): Promise<Result<void>> {
    try {
      const result = await this._db.notification.updateMany({
        where: {
          id: {
            in: ids,
          },
        },
        data: { isDeleted: true },
      });

      if (!result.count)
        return Result.fail(Errors.internal('Faild to delete notifications'));

      return Result.ok(undefined);
    } catch (err) {
      return ErrorMapper.toResult(err, this._entityName);
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      const result = await this._db.notification.update({
        where: { id },
        data: { isDeleted: true },
      });

      if (!result) return Result.fail(Errors.internal('Deleted failed'));
      return Result.ok(undefined);
    } catch (err) {
      return ErrorMapper.toResult(err, this._entityName);
    }
  }
}
