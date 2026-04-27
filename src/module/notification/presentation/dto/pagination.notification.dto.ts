import { IsNumber, IsOptional } from 'class-validator';

export class QueryPaginationNotification {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}
