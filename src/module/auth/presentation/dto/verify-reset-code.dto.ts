import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class VerifyPasswordResetCode {
  @IsEmail()
  email!: string;
  @IsString()
  @MaxLength(6)
  @MinLength(6)
  code!: string;
}
