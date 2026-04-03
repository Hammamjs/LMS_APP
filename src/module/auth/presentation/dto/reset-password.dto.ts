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
  confirmPassword: string;
}
