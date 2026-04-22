import { Errors, IUseCase, ResponseBuilder, Result } from '@/core';
import { IPAYMENT_REPOSITORY } from '@/module/payment/domain/constants/injection.token';
import { type IPaymentRepository } from '@/module/payment/domain/repository/payment.interface';
import { Inject, Injectable } from '@nestjs/common';
import {
  PaymentMapper,
  TPaymentPaginationResult,
} from '../../mapper/payment.mapper';

@Injectable()
export class UserPaymentHistoryUseCase implements IUseCase<
  string,
  Promise<Result<TPaymentPaginationResult>>
> {
  constructor(
    @Inject(IPAYMENT_REPOSITORY)
    private readonly paymentRepo: IPaymentRepository,
  ) {}

  async execute(userId: string): Promise<Result<TPaymentPaginationResult>> {
    const paymentResult = await this.paymentRepo.findUserPayments({ userId });

    if (!paymentResult.ok)
      return Result.fail(Errors.notFound('User has no payments yet'));

    const { data, meta } = paymentResult.value;

    const toResponse = ResponseBuilder.paginateMapped(
      data,
      meta,
      PaymentMapper.toResponse,
    );

    return Result.ok(toResponse);
  }
}
