import { IsEmail, IsString } from 'class-validator';

export class ResendCode {
  @IsString()
  @IsEmail()
  email!: string;
}
