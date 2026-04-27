import { PaginationParams, PaginationResult } from '@/core';
import { User } from '../entity/user.entity';
import { Result } from '@/core/common/domain/result.pattern';
import { UserRole } from '../interface/role.interface';

export interface IUserRepository {
  findAll: (
    params: UserPaginationParams,
  ) => Promise<Result<PaginationResult<User>>>;

  findById: (id: string) => Promise<Result<User>>;
  delete: (id: string) => Promise<Result<void>>;
  findByEmail: (email: string) => Promise<Result<User>>;
  save: (user: User) => Promise<Result<User>>;
}

export interface UserPaginationParams extends PaginationParams {
  readonly isVerified?: boolean;
  readonly role?: UserRole;
}
