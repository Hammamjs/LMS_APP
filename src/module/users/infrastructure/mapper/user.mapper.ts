import { Users as UserPrisma } from '@prisma/client';
import { UserRole } from '../../domain/interface/role.interface';
import { User } from '../../domain/entity/user.entity';
export class MapperUser {
  private constructor() {}

  public static toDomain(raw: UserPrisma) {
    return User.rehydrate({
      id: raw.id,
      email: raw.email,
      username: raw.username,
      role: raw.role as UserRole,
      password: raw.password,
      phone: raw.phone,
      isVerified: raw.isVerified,
      emailVerified: raw.emailVerified,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      refreshToken: raw.refreshToken,
      isPasswordCodeVerified: raw.isPasswordCodeVerified,
      passwordUpdatedAt: raw.passwordUpdatedAt,
    });
  }
}
