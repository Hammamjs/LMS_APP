import { PrismaService } from '@/core/database/prisma.service';
import { Injectable } from '@nestjs/common';
import { TransactionContext } from './transaction.context';
import { IUow } from '@/core/common/domain/unit-of-work.interface';

@Injectable()
export class PrismaUnitOfWork implements IUow {
  constructor(
    private readonly prisma: PrismaService,
    private readonly context: TransactionContext,
  ) {}

  runInTransaction<T>(work: () => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      return this.context.run(tx, work);
    });
  }
}
