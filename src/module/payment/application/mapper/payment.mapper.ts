import { ApiPaginateResponse } from '@/core';
import { Payment } from '../../domain/entity/payment.entity';
import {
  PaymentProvider,
  PaymentStatus,
} from '../../domain/entity/payment.types';

export type PaymentWithCourse = {
  id: string;
  userId: string;
  amount: number;
  status: PaymentStatus;
  paymentId: string;
  provider: PaymentProvider;
  createdAt: Date;

  course?: {
    id: string;
    title: string;
    duration: number;
    enrollments: {
      status: string;
    }[];
  };
};

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

  static toResponseFromQuery(this: void, payment: PaymentWithCourse) {
    return {
      id: payment.id,
      userId: payment.userId,
      status: payment.status,
      provider: payment.provider,
      amount: payment.amount,
      transactionId: payment.paymentId,
      createdAt: payment.createdAt,

      course: payment.course
        ? {
            id: payment.course.id,
            title: payment.course.title,
            duration: payment.course.duration,
            enrollments: payment.course.enrollments,
          }
        : null,
    };
  }
}

export type TPaymentResponse = ReturnType<typeof PaymentMapper.toResponse>;
export type TPaymentPaginationResult = ApiPaginateResponse<TPaymentResponse>;
