import { UserRole } from '../types/UserRole.type';
import { User } from './user.entity';
export type TUser = {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  isVerified: boolean;
  emailVerified: Date | null;
  phone: string | null;
};
export interface IUserRepository {
  findAll: () => Promise<User[]>;
  findOne: (id: string) => Promise<User | null>;
  delete: (id: string) => Promise<User | null>;
  save: (user: TUser) => Promise<User>;
}
