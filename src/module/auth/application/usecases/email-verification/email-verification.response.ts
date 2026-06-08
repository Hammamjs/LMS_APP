import { UserResponse } from '@/module/users';

export class EmailVerificationResponse {
  constructor(
    public user: UserResponse,
    public accessToken: string,
    public refreshToken: string,
  ) {}
}
