import { User } from '@/module/users/domain/entity/user.entity';

export class AuthResponse {
  constructor() {}

  static from(user: User) {
    return {
      id: user.getId(),
      username: user.getUsername(),
      role: user.getRole(),
      email: user.getEmail(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
      isVerified: user.getIsVerified(),
      emailVerified: user.getEmailVerified(),
      phone: user.getPhone(),
    };
  }
}
