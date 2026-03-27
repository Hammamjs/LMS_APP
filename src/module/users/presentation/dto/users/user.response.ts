import { User } from '@/module/users/domain/entity/user.entity';
import { UserRole } from '@/module/users/domain/interface/role.interface';

export class UserResponse {
  public id: string;
  public username: string;
  public email: string;
  public isVerified: boolean;
  public emailVerified: Date | null;
  public createdAt: Date;
  public updatedAt: Date;
  public role: UserRole;
  public phone: string | null;

  constructor(user: User) {
    this.id = user.id!;
    this.username = user.username;
    this.email = user.email;
    this.isVerified = user.isVerified;
    this.emailVerified = user.emailVerified;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
    this.role = user.role;
    this.phone = user.phone;
  }

  public static from(user: User) {
    return new UserResponse(user);
  }
}
