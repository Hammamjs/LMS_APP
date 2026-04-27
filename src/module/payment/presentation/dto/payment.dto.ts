import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { type PaymentProvider } from '../../domain/entity/payment.types';

export class PaymentDto {
  @IsNumber()
  @Type(() => Number)
  amount!: number;

  @IsUUID()
  courseId!: string;

  @IsOptional()
  currency!: string;

  @IsEnum(['BANK', 'STRIPE'], { message: 'Valid provider required' })
  provider!: PaymentProvider;

  @IsNotEmpty()
  @IsString()
  source!: string;
}
