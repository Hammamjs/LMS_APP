import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { TransactionContext } from '../common/infrastructure/http/transaction/transaction.context';

@Global()
@Module({
  exports: [PrismaService, TransactionContext],
  providers: [PrismaService, TransactionContext],
})
export class PrismaModule {}
