import { PaginationResult, Result } from '@/core';
import { Payment } from '../entity/payment.entity';
import { PaymentPaginationResult } from '../entity/payment.types';

export interface PaymentCharageParams {
  amount: number;
  currency: string;
  source: string;
  email: string;
  paymentId: string;
}

export interface PaymentResponse {
  paymentId: string;
  status: 'SUCCESS' | 'FAILED';
  rawResponse: any;
}

export interface IPaymentGateway {
  getName: () => string;
  pay: (params: PaymentCharageParams) => Promise<Result<PaymentResponse>>;
}

export interface IPaymentRepository {
  save: (payment: Payment) => Promise<Result<Payment>>;
  findById: (id: string) => Promise<Result<Payment>>;
  findByPaymentId: (paymentId: string) => Promise<Result<Payment>>;
  findUserPayments: (
    params: PaymentPaginationResult,
  ) => Promise<Result<PaginationResult<Payment>>>;
  findByStatus: (
    params: PaymentPaginationResult,
  ) => Promise<Result<PaginationResult<Payment>>>;
}
