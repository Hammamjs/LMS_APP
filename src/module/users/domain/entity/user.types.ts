import { UserRole } from '../interface/role.interface';

export interface CreateUserProps {
  id?: string;
  email: string;
  username: string;
  password: string;
  avatar: string | null;
  role: UserRole | null;
  phone: string | null;
  bio: string | null;
}

export interface RehydrateUserProps {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  password: string;
  phone: string | null;
  isVerified: boolean;
  avatar: string | null;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
  refreshToken: string | null;
  passwordUpdatedAt: Date | null;
  isPasswordCodeVerified: boolean;
  bio: string | null;
}

export interface UserProps {
  email: string;
  username: string;
  role: UserRole;
  phone: string | null;
  avatar: string | null;
  isVerified: boolean;
  emailVerified: Date | null;
  password: string;
  refreshToken: string | null;
  passwordUpdatedAt: Date | null;
  isPasswordCodeVerified: boolean;
  bio: string | null;
}

export interface UserState {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  password: string;
  phone: string | null;
  avatar: string | null;
  isVerified: boolean;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
  refreshToken: string | null;
  passwordUpdatedAt: Date | null;
  isPasswordCodeVerified: boolean;
  bio: string | null;
}
