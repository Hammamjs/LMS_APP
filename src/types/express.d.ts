import { UserRole } from '@/module/users';

declare global {
  declare namespace Express {
    export interface User {
      id: string;
      email: string;
      role: UserRole;
    }

    export interface Request {
      user: User;
    }
  }
}

export {};
