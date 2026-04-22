import { Injectable } from '@nestjs/common';
import { IPaymentRepository } from '../../domain/repository/payment.interface';
import { Payment as PrismaPayment } from '@prisma/client';
import {
  ErrorMapper,
  Errors,
  paginate,
  PaginationResult,
  PrismaService,
  Result,
} from '@/core';
import { TransactionContext } from '@/core/common/infrastructure/http/transaction/transaction.context';
import { Prisma } from '@prisma/client';
import { Payment } from '../../domain/entity/payment.entity';
import { PaymentEntityMapper } from '../mapper/payment.entity.mapper';
import { PaymentPaginationResult } from '../../domain/entity/payment.types';

@Injectable()
export class PaymentPrisma implements IPaymentRepository {
  private readonly _entityName = 'Payment';
  constructor(
    private readonly prisma: PrismaService,
    private readonly context: TransactionContext,
  ) {}

  private get _db() {
    const store = this.context.getStore();
    return store?.tx || this.prisma;
  }

  async findById(id: string): Promise<Result<Payment>> {
    try {
      const result = await this._db.payment.findUnique({ where: { id } });
      if (!result)
        return Result.fail(
          Errors.notFound('No succeeded payment found with this id'),
        );
      const toDomain = PaymentEntityMapper.toDomain(result);
      return Result.ok(toDomain);
    } catch (err) {
      return ErrorMapper.toResult(err, this._entityName);
    }
  }

  async findByPaymentId(paymentId: string): Promise<Result<Payment>> {
    try {
      const result = await this._db.payment.findFirst({
        where: { paymentId },
      });
      if (!result)
        return Result.fail(
          Errors.notFound('No succeeded payment found with this id'),
        );
      const toDomain = PaymentEntityMapper.toDomain(result);
      return Result.ok(toDomain);
    } catch (err) {
      return ErrorMapper.toResult(err, this._entityName);
    }
  }

  async findByStatus(
    params: PaymentPaginationResult,
  ): Promise<Result<PaginationResult<Payment>>> {
    const { page, limit, status } = params;
    const where: Prisma.PaymentWhereInput = {
      ...(status && { status }),
    };
    try {
      const paginationData = await paginate(
        { page, limit },
        (args) => this._db.payment.findMany({ ...args, where }),
        (args) => this._db.payment.count({ ...args, where }),
        (row) => PaymentEntityMapper.toDomain(row),
      );

      if (!paginationData.ok) return paginationData;

      return paginationData;
    } catch (err) {
      return ErrorMapper.toResult(err, this._entityName);
    }
  }

  async findUserPayments(
    params: PaymentPaginationResult,
  ): Promise<Result<PaginationResult<Payment>>> {
    const { limit, page, userId, status } = params;

    const where: Prisma.PaymentWhereInput = {
      ...(userId && { userId }),
      ...(status && { status }),
    };

    try {
      const paginateData = await paginate(
        { limit, page },
        (args) => this._db.payment.findMany({ ...args, where }),
        (args) => this._db.payment.count({ ...args, where }),
        (row) => PaymentEntityMapper.toDomain(row),
      );

      if (!paginateData.ok) return paginateData;

      return paginateData;
    } catch (err) {
      return ErrorMapper.toResult(err, this._entityName);
    }
  }

  async save(payment: Payment): Promise<Result<Payment>> {
    let data: PrismaPayment;

    try {
      data = await this._db.payment.upsert({
        where: { id: payment.getId },
        update: payment.toPersistence,
        create: payment.toPersistence,
      });

      const toDomain = PaymentEntityMapper.toDomain(data);

      return Result.ok(toDomain);
    } catch (err) {
      return ErrorMapper.toResult(err, this._entityName);
    }
  }
}
