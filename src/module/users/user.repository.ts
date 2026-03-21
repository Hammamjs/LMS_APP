import { User } from './user.entity';

export interface IUserRepository {
  findAll: () => Promise<User[]>;
  findOne: (id: string) => Promise<User | null>;
  delete: (id: string) => Promise<User | null>;
  save: (user: User) => Promise<User>;
}
