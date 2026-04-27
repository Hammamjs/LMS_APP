import { Result } from '@/core';
import {
  IPaymentGateway,
  PaymentCharageParams,
  PaymentResponse,
} from '../../domain/repository/payment.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BankGatewayService implements IPaymentGateway {
  getName(): string {
    return 'BANK';
  }

  async pay(params: PaymentCharageParams): Promise<Result<PaymentResponse>> {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return Result.ok({
      paymentId: `BANK-TRX-${Math.random().toString(36).toUpperCase().substring(2, 10)}`,
      status: 'SUCCESS',
      rawResponse: {
        method: 'Bank Transfer',
        date: new Date().toISOString(),
        amountProcessed: params.amount,
      },
    });
  }
}
