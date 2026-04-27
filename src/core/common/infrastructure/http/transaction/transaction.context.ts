import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AsyncLocalStorage } from 'async_hooks';

type PrismaTransaction = Prisma.TransactionClient;

@Injectable()
export class TransactionContext {
  private readonly als = new AsyncLocalStorage<{ tx: PrismaTransaction }>();

  run<T>(tx: PrismaTransaction, fn: () => Promise<T>): Promise<T> {
    return this.als.run({ tx }, fn);
  }

  getStore() {
    return this.als.getStore();
  }
}
