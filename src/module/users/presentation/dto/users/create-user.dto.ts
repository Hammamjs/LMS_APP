import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { UserRole } from '@/module/users/domain/interface/role.interface';
import { Match } from '@/core';

export class CreatUserDto {
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  username!: string;

  @IsOptional()
  @IsEnum(UserRole)
  role!: UserRole | null;

  @IsOptional()
  phone!: string | null;

  @IsNotEmpty()
  password!: string;

  @Match('password', { message: 'Password must matched' })
  confirmPassword!: string;
}
