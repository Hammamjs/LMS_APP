import { IsOptional, IsString } from 'class-validator';

export class PaymentQuery {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  status?: 'SUCCESS' | 'FAILED' | 'PENDING';
}
