import { Payment as PrismaPayment } from '@prisma/client';
import { Payment } from '../../domain/entity/payment.entity';

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

export class PaymentEntityMapper {
  private constructor() {}

  static toDomain(raw: PaymentWithCourse): Payment {
    return Payment.rehydrate({
      id: raw.id,
      userId: raw.userId,
      courseId: raw.courseId,
      amount: raw.amount,
      provider: raw.provider,
      paymentId: raw.paymentId,
      createdAt: raw.createdAt,
      status: raw.status,
    });
  }
}
