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
    this.id = user.getId();
    this.username = user.getUsername();
    this.email = user.getEmail();
    this.isVerified = user.getIsVerified();
    this.emailVerified = user.getEmailVerified();
    this.createdAt = user.getCreatedAt();
    this.updatedAt = user.getUpdatedAt();
    this.role = user.getRole();
    this.phone = user.getPhone();
  }

  public static from(user: User) {
    return new UserResponse(user);
  }
}
