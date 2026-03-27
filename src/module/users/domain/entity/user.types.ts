import { UserRole } from '../interface/role.interface';

export type TUser = {
  id?: string;
  email: string;
  username: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
  phone?: string | null;
};
