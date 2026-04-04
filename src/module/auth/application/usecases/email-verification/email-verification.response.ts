import { User } from '@/module/users/domain/entity/user.entity';

export class EmailVerificationResponse {
  constructor(
    public user: User,
    public accessToken: string,
    public refreshToken: string,
  ) {}
}
