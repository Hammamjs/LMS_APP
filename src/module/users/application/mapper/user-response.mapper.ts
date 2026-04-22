import { ApiPaginateResponse } from '@/core';
import { User } from '../../domain/entity/user.entity';

export class UserResponseMapper {
  private constructor() {}

  static toResponse(this: void, user: User) {
    return {
      id: user.getId(),
      email: user.getEmail(),
      username: user.getUsername(),
      role: user.getRole(),
      phone: user.getPhone(),
      isVerified: user.getIsVerified(),
      emailVerified: user.getEmailVerified(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
      passwordUpdatedAt: user.getPasswordUpdatedAt(),
    };
  }
}
type UserResponse = ReturnType<typeof UserResponseMapper.toResponse>;
export type TUserResponse = ApiPaginateResponse<UserResponse>;
