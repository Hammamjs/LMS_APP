import { IBcryptService } from '@/module/auth/domain/service/bcrypt.service';
import { ForbiddenError } from '../../errors/forbidden.error';
import { InvalideEmailError } from '../../errors/invalide-email.error';
import { InvalideUsernameError } from '../../errors/invalide-username.error';
import { UserRole } from './../interface/role.interface';

type CreateUserProps = {
  id?: string;
  email: string;
  username: string;
  password: string;
  role: UserRole | null;
  phone: string | null;
};

type RehydrateUserProps = {
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
};

type UserProps = {
  email: string;
  username: string;
  role: UserRole;
  phone: string | null;
  isVerified: boolean;
  emailVerified: Date | null;
  password: string;
  refreshToken?: string;
};

export class User {
  private constructor(
    public readonly id: string | undefined,
    public readonly email: string,
    public readonly username: string,
    public readonly role: UserRole,
    private readonly password: string,
    public readonly phone: string | null,
    public readonly isVerified: boolean = false,
    public readonly emailVerified: Date | null = null,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
    private readonly refreshToken: string | null = null,
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
      data.password,
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
      props.password,
      props.phone,
      props.isVerified,
      props.emailVerified,
      props.createdAt,
      props.updatedAt,
      props.refreshToken,
    );
  }

  public async comparePassword(
    plain: string,
    hashService: IBcryptService,
  ): Promise<boolean> {
    const hash = this.getHashedPassword();

    if (!hash) return false;

    return hashService.compare(plain, hash);
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

  public getHashedPassword(): string {
    return this.password;
  }

  public updateRefreshToke(newIssuedToken: string) {
    return this.copy({ refreshToken: newIssuedToken });
  }

  public getRefreshToken(): string | null {
    return this.refreshToken || null;
  }

  private copy(props: Partial<UserProps>): User {
    return new User(
      this.id,
      props.email ?? this.email,
      props.username ?? this.username,
      props.role ?? this.role,
      props.password ?? this.password,
      props.phone ?? this.phone,
      props.isVerified ?? this.isVerified,
      props.emailVerified ?? this.emailVerified,
      this.createdAt,
      new Date(), // updatedAt
    );
  }
}
