import { Injectable } from '@nestjs/common';
import { PaymentProcessUseCase } from './usecases/process-payment/payment.usecase';
import { UserPaymentHistoryUseCase } from './usecases/user-payments/user-payment-history.usecase';

@Injectable()
export class PaymentFacade {
  constructor(
    public readonly pay: PaymentProcessUseCase,
    public readonly UserPaymentHistory: UserPaymentHistoryUseCase,
  ) {}
}
