import { UserRole } from '@/module/users/domain/interface/role.interface';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, Max, Min } from 'class-validator';

export class PaginationQuery {
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit: number = 10;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Transform(({ value }) => {
    return value === 'true';
  })
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Invalid role query' })
  role?: UserRole;
}
