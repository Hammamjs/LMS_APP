import { Global, Module } from '@nestjs/common';
import { TransactionContext } from '../http/transaction/transaction.context';
@Global()
@Module({
  exports: [TransactionContext],
  providers: [TransactionContext],
})
export class TransactionModule {}
