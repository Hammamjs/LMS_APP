import { ApiPaginateResponse } from '@/core';
import { User } from '../../domain/entity/user.entity';

export class UserResponseMapper {
  private constructor() {}

  static toResponse(this: void, user: User) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      phone: user.phone,
      isVerified: user.isVerified,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      passwordUpdatedAt: user.passwordUpdatedAt,
      bio: user.bio,
    };
  }
}
export type UserResponse = ReturnType<typeof UserResponseMapper.toResponse>;
export type TUserResponse = ApiPaginateResponse<UserResponse>;
