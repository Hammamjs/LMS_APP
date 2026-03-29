import { UserRole } from '../interface/role.interface';

export interface CreateUserProps {
  id?: string;
  email: string;
  username: string;
  password: string;
  role: UserRole | null;
  phone: string | null;
}

export interface RehydrateUserProps {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  password: string;
  phone: string | null;
  isVerified: boolean;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
  refreshToken: string | null;
}

export interface UserProps {
  email: string;
  username: string;
  role: UserRole;
  phone: string | null;
  isVerified: boolean;
  emailVerified: Date | null;
  password: string;
  refreshToken?: string;
}

export interface UserState {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  password: string;
  phone: string | null;
  isVerified: boolean;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
  refreshToken: string | null;
}
