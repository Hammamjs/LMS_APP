import { User } from '../entity/user.entity';
import { Result } from '@/core/common/domain/result.pattern';

type FindAllReturned = Promise<Result<{ users: User[]; total: number }>>;
export interface IUserRepository {
  findAll: (params: { skip: number; take: number }) => FindAllReturned;
  findById: (id: string) => Promise<Result<User>>;
  delete: (id: string) => Promise<Result<void>>;
  findByEmail: (email: string) => Promise<Result<User>>;
  save: (user: User) => Promise<Result<User>>;
}
