import { User } from '@/module/users/domain/entity/user.entity';

export class AuthResponse {
  constructor() {}

  static from(user: User) {
    return {
      id: user.id,
      username: user.username,
      role: user.role,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isVerified: user.isVerified,
      emailVerified: user.email,
      phone: user.phone,
    };
  }
}
