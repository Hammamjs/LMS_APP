import { Payment as PrismaPayment } from '@prisma/client';
import { Payment } from '../../domain/entity/payment.entity';

export class PaymentEntityMapper {
  private constructor() {}

  static toDomain(rawPayment: PrismaPayment) {
    return Payment.rehydrate(rawPayment);
  }
}
