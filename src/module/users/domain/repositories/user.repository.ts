import { User } from '../entity/user.entity';
import { TUser } from '../entity/user.types';
import { Result } from '@/core/common/result.pattern';

export interface IUserRepository {
  findAll: () => Promise<Result<User[]>>;
  findOne: (id: string) => Promise<Result<User | null>>;
  delete: (id: string) => Promise<Result<User | null>>;
  findByEmail: (email: string) => Promise<Result<User | null>>;
  save: (user: TUser) => Promise<Result<User>>;
}
