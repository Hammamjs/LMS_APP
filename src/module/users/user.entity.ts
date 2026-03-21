import { UserRole } from './enums/UserRole.enum';
import { ForbiddenError } from './errors/forbidden.error';
import { InvalideEmailError } from './errors/invalide-email.error';
import { InvalideUsernameError } from './errors/invalide-username.error';

type UserInformation = {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
  emailVerified: Date;
  role: UserRole;
  passwordHashed?: string;
  isVerified?: boolean;
  updatedAt?: Date;
  phone?: string;
};

export class User {
  private constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly username: string,
    public readonly createdAt: Date,
    public readonly role: UserRole = UserRole.STUDENT,
    private passwordHashed?: string,
    public readonly emailVerified?: Date,
    public readonly isVerified: boolean = false,
    public readonly updatedAt?: Date,
    public readonly phone?: string,
  ) {}

  public static create(data: UserInformation): User {
    if (!data.email || !data.email.includes('@'))
      throw new InvalideEmailError();

    if (!data.username.trim()) throw new InvalideUsernameError();

    return new User(
      data.id,
      data.email,
      data.username,
      data.createdAt,
      data.role,
      data.passwordHashed,
      data.emailVerified,
      data.isVerified ?? false,
      data.updatedAt,
      data.phone,
    );
  }

  public withEmail(newEmail: string): User {
    return this.copy({ email: newEmail });
  }

  public withPassword(newHashedPassword: string): User {
    return this.copy({ passwordHashed: newHashedPassword });
  }

  public withUsername(newUsername: string) {
    if (!newUsername.trim()) throw new InvalideUsernameError();

    return this.copy({ username: newUsername });
  }

  public verify() {
    if (this.isVerified) return this;
    return this.copy({ isVerified: true, emailVerified: new Date() });
  }

  public changeRole(newRole: UserRole, performedBy: User) {
    if (!performedBy.isAdmin())
      throw new ForbiddenError('Only Admins can change roles');

    if (this.id === performedBy.id)
      throw new ForbiddenError('Admin cannot change their own role');

    return this.copy({ role: newRole });
  }

  public hasRole(...roles: UserRole[]) {
    return roles.includes(this.role);
  }

  public isAdmin() {
    return this.role === UserRole.ADMIN;
  }

  private copy(props: Partial<UserInformation>): User {
    return User.create({
      id: this.id,
      email: this.email,
      username: this.username,
      createdAt: this.createdAt,
      role: this.role,
      passwordHashed: this.passwordHashed,
      emailVerified: this.emailVerified ?? new Date(),
      isVerified: this.isVerified,
      phone: this.phone,
      ...props,
      updatedAt: new Date(),
    });
  }
}
