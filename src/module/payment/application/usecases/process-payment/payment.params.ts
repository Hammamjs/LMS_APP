import { PaymentProvider } from '@/module/payment/domain/entity/payment.types';

export class PaymentParams {
  constructor(
    public readonly amount: number,
    public readonly currency: string,
    public readonly source: string,
    public readonly email: string,
    public readonly courseId: string,
    public readonly provider: PaymentProvider,
    public readonly userId: string,
  ) {}
}
