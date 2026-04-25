import { Type } from 'class-transformer';
import { IsOptional, Max, Min } from 'class-validator';

export class PaginationQuery {
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit: number;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page: number;
}
