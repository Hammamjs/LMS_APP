import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { UserRole } from '@/module/users/domain/interface/role.interface';

export class CreatUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  username: string;

  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  phone: string | null;
}
