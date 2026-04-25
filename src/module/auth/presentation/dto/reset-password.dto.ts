import { Match } from '@/core/common/decorators/match.decorator';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class ResetPassword {
  @IsEmail()
  email: string;

  @IsString()
  @MaxLength(20)
  @MinLength(6)
  newPassword: string;

  // build decorator

  @IsString()
  @Match('password', { message: 'password do not match' })
  confirmPassword: string;
}
