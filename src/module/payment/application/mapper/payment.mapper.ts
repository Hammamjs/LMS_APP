import { ApiPaginateResponse } from '@/core';
import { Payment } from '../../domain/entity/payment.entity';

export class PaymentMapper {
  private constructor() {}

  static toResponse(this: void, payment: Payment) {
    return {
      id: payment.getId,
      userId: payment.getUserId,
      status: payment.getStatus,
      provider: payment.getProvider,
      amount: payment.getAmount,
      transactionId: payment.getPaymentId,
      createdAt: payment.getCreatedAt,
    };
  }
}

export type TPaymentResponse = ReturnType<typeof PaymentMapper.toResponse>;
export type TPaymentPaginationResult = ApiPaginateResponse<TPaymentResponse>;
