import { PaymentStatus } from '@/module/payment/domain/entity/payment.types';

export class UserPaymentHistoryParams {
  constructor(
    public readonly userId: string,
    public readonly search?: string,
    public readonly status?: PaymentStatus,
  ) {}
}
