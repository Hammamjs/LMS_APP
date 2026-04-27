import { Injectable } from '@nestjs/common';
import { IPaymentGateway } from '../../domain/repository/payment.interface';
import { BankGatewayService } from './bank.gateway';
import { StripeGatewayService } from './stripe.gateway';

@Injectable()
export class PaymentFactory {
  private readonly gateways: Map<string, IPaymentGateway>;

  constructor(
    private readonly stripeServie: StripeGatewayService,
    private readonly bankServie: BankGatewayService,
  ) {
    this.gateways = new Map([
      [this.bankServie.getName(), this.bankServie],
      [this.stripeServie.getName(), this.stripeServie],
    ]);
  }

  get(name: string): IPaymentGateway {
    const provider = this.gateways.get(name.toUpperCase());
    if (!provider) throw new Error(`Gateway ${name} not supported`);

    return provider;
  }
}
