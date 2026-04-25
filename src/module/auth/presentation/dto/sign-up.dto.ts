import { Match } from '@/core/common/decorators/match.decorator';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @Match('password', { message: 'Passwords do not match' })
  confirmPassword: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  username: string;
}
