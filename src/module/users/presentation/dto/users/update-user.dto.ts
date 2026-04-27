import { UserRole } from '@/module/users/domain/interface/role.interface';
import { IsEmail, IsEnum, IsOptional, IsUUID } from 'class-validator';

export class UpdateUserDto {
  @IsUUID()
  id!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  username!: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  phone?: string | undefined;

  @IsOptional()
  isVerified?: boolean;
}
