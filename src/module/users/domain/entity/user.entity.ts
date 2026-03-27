import { ForbiddenError } from '../../errors/forbidden.error';
import { InvalideEmailError } from '../../errors/invalide-email.error';
import { InvalideUsernameError } from '../../errors/invalide-username.error';
import { UserRole } from './../interface/role.interface';

type CreateUserProps = {
  id?: string;
  email: string;
  username: string;
  role: UserRole | null;
  phone: string | null;
};

type RehydrateUserProps = {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  password: string | null;
  phone: string | null;
  isVerified: boolean;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export class User {
  private constructor(
    public readonly id: string | undefined,
    public readonly email: string,
    public readonly username: string,
    public readonly role: UserRole,
    private readonly password: string | null,
    public readonly phone: string | null,
    public readonly isVerified: boolean = false,
    public readonly emailVerified: Date | null = null,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  public static create(data: CreateUserProps): User {
    if (!data.email || !data.email.includes('@'))
      throw new InvalideEmailError();

    if (!data.username.trim()) throw new InvalideUsernameError();

    return new User(
      data.id,
      data.email,
      data.username,
      data.role ?? UserRole.Student,
      null, // password
      data.phone,
    );
  }

  // ✅ For DB → Domain
  public static rehydrate(props: RehydrateUserProps): User {
    return new User(
      props.id,
      props.email,
      props.username,
      props.role,
      props.phone,
      props.password,
      props.isVerified,
      props.emailVerified,
      props.createdAt,
      props.updatedAt,
    );
  }

  public withEmail(newEmail: string): User {
    return this.copy({ email: newEmail });
  }

  public withPassword(newHashedPassword: string): User {
    return this.copy({ password: newHashedPassword });
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
    return this.role === UserRole.Admin;
  }

  private copy(
    props: Partial<{
      email: string;
      username: string;
      role: UserRole;
      phone: string | null;
      isVerified: boolean;
      emailVerified: Date | null;
      password?: string;
    }>,
  ): User {
    return new User(
      this.id,
      props.email ?? this.email,
      props.username ?? this.username,
      props.role ?? this.role,
      props.phone ?? this.phone,
      props.password ?? this.password,
      props.isVerified ?? this.isVerified,
      props.emailVerified ?? this.emailVerified,
      this.createdAt,
      new Date(), // updatedAt
    );
  }
}
