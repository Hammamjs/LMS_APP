import { randomUUID } from 'crypto';
import { PaymentState, PaymentStatus } from './payment.types';

export class Payment {
  private constructor(private readonly props: PaymentState) {}

  get getId(): string {
    return this.props.id;
  }

  get getProvider(): string {
    return this.props.provider;
  }

  get getCourseId(): string {
    return this.props.courseId;
  }

  get getAmount(): number {
    return this.props.amount;
  }

  get getPaymentId(): string {
    return this.props.paymentId;
  }

  get getCreatedAt(): Date {
    return this.props.createdAt;
  }

  get getUserId(): string {
    return this.props.userId;
  }

  get getStatus(): PaymentStatus {
    return this.props.status;
  }

  markPaymentAsSucceeded(paymentId: string): Payment {
    return this._copy({
      status: 'SUCCESS',
      paymentId: paymentId || this.props.paymentId,
    });
  }

  markPaymentAsFailed(): Payment {
    return this._copy({ status: 'FAILED' });
  }

  public static create(
    props: Omit<PaymentState, 'id' | 'createdAt' | 'Status'>,
  ): Payment {
    return new Payment({
      ...props,
      id: randomUUID(),
      createdAt: new Date(),
      status: 'PENDING',
    });
  }

  public static rehydrate(props: PaymentState): Payment {
    return new Payment(props);
  }

  get toPersistence() {
    return {
      id: this.props.id,
      userId: this.props.userId,
      amount: this.props.amount,
      courseId: this.props.courseId,
      paymentId: this.props.paymentId,
      status: this.props.status,
      provider: this.props.provider,
      createdAt: this.props.createdAt,
    };
  }

  private _copy(params?: Partial<Omit<PaymentState, 'id'>>): Payment {
    return new Payment({ ...this.props, ...params });
  }
}
