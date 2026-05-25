import { Match } from '@/core/common/decorators/match.decorator';
import { IsString, IsStrongPassword } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @IsStrongPassword()
  newPassword!: string;

  @Match('newPassword', { message: 'Passwords not matched' })
  confirmPassword!: string;

  @IsString()
  currentPassword!: string;
}
