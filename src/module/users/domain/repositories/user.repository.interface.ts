import { User } from '../entity/user.entity';
import { Result } from '@core/common/result.pattern';

export interface IUserRepository {
  findAll: () => Promise<Result<User[]>>;
  findOne: (id: string) => Promise<Result<User>>;
  delete: (id: string) => Promise<Result<void>>;
  findByEmail: (email: string) => Promise<Result<User>>;
  save: (user: User) => Promise<Result<User>>;
}
