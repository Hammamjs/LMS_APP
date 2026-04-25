import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class EmailVerification {
  @IsNotEmpty()
  @IsString()
  @MaxLength(6)
  @MinLength(6)
  code: string;

  @IsEmail()
  email: string;
}
