import { PaginationResult, Result } from '@/core';
import { Payment } from '../entity/payment.entity';
import { PaymentPaginationResult } from '../entity/payment.types';
import { Payment as PrismaPayment } from '@prisma/client';

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

export type PaymentWithCourse = PrismaPayment & {
  course?: {
    id: string;
    title: string;
    duration: number;
    enrollments: {
      status: string;
    }[];
  };
};

export interface IPaymentRepository {
  save: (payment: Payment) => Promise<Result<Payment>>;
  findById: (id: string) => Promise<Result<Payment>>;
  findByPaymentId: (paymentId: string) => Promise<Result<Payment>>;
  findUserPayments: (
    params: PaymentPaginationResult,
  ) => Promise<Result<PaginationResult<PaymentWithCourse>>>;
  findByStatus: (
    params: PaymentPaginationResult,
  ) => Promise<Result<PaginationResult<Payment>>>;
}
