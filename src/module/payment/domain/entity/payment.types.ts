import { PaginationParams } from '@/core';

export type PaymentStatus = 'SUCCESS' | 'FAILED' | 'PENDING';
export type PaymentProvider = 'BANK' | 'STRIPE';

export interface PaymentState {
  userId: string;
  id: string;
  courseId: string;
  amount: number;
  provider: PaymentProvider;
  paymentId: string;
  createdAt: Date;
  status: PaymentStatus;
}

export interface PaymentPaginationResult extends PaginationParams {
  status?: PaymentStatus;
  userId?: string;
}
