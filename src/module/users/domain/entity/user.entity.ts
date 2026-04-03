import { ForbiddenError } from '../../errors/forbidden.error';
import { InvalidEmailError } from '../../errors/invalid-email.error';
import { InvalidUsernameError } from '../../errors/invalid-username.error';
import { UserRole } from './../interface/role.interface';
import {
  CreateUserProps,
  RehydrateUserProps,
  UserProps,
  UserState,
} from './user.types';

export class User {
  private constructor(
    private readonly props: UserState,
    public readonly isNew: boolean,
  ) {}

  public static create(data: CreateUserProps): User {
    if (!data.email.includes('@')) throw new InvalidEmailError();

    return new User(
      {
        ...data,
        id: data.id ?? crypto.randomUUID(),
        isVerified: false,
        emailVerified: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        refreshToken: null,
        role: data.role as UserRole,
      },
      true, // for new users
    );
  }

  public getId(): string {
    return this.props.id;
  }

  public getEmail(): string {
    return this.props.email;
  }

  public getUsername(): string {
    return this.props.username;
  }

  public getPhone(): string | null {
    return this.props.phone;
  }

  public getRole(): UserRole {
    return this.props.role;
  }

  public getIsVerified(): boolean {
    return this.props.isVerified;
  }

  public getHashedPassword(): string {
    return this.props.password;
  }

  public getRefreshToken(): string | null {
    return this.props.refreshToken || null;
  }

  public getEmailVerified(): Date | null {
    return this.props.emailVerified;
  }

  public getCreatedAt(): Date {
    return this.props.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  public withUsername(newUsername: string): User {
    if (!newUsername || this.IsSame(this.props.username, newUsername))
      return this;
    if (!newUsername.trim()) throw new InvalidUsernameError();

    return this.copy({ username: newUsername.trim() });
  }

  public withPassword(newHashedPassword: string): User {
    return this.copy({ password: newHashedPassword });
  }

  public withEmail(newEmail: string): User {
    return this.copy({ email: newEmail });
  }

  public withPhone(newPhone?: string): User {
    if (!newPhone || this.IsSame(this.props.phone ?? '', newPhone)) return this;
    return this.copy({ phone: newPhone });
  }

  public verify() {
    if (this.props.isVerified) return this;
    return this.copy({
      isVerified: true,
      emailVerified: this.props.emailVerified ?? new Date(),
    });
  }

  public updateRefreshToken(newIssuedToken: string | null) {
    return this.copy({ refreshToken: newIssuedToken });
  }

  public changeRole(newRole: UserRole, performedBy: User) {
    if (!performedBy.isAdmin())
      throw new ForbiddenError('Only Admins can change roles');

    if (this.props.id === performedBy.props.id)
      throw new ForbiddenError('Admin cannot change their own role');

    return this.copy({ role: newRole });
  }

  public markPasswordCodeVerified(): User {
    return this.copy({ isPasswordCodeVerified: true });
  }

  public resetPasswordCodeFlag(): User {
    return this.copy({ isPasswordCodeVerified: false });
  }

  // ✅ For DB → Domain
  public static rehydrate(props: RehydrateUserProps): User {
    return new User(props, false);
  }

  public hasRole(...roles: UserRole[]) {
    return roles.includes(this.props.role);
  }

  public isAdmin() {
    return this.props.role === UserRole.Admin;
  }

  public toPersistence() {
    return {
      id: this.props.id,
      email: this.props.email,
      username: this.props.username,
      phone: this.props.phone,
      isVerified: this.props.isVerified,
      emailVerified: this.props.emailVerified,
      password: this.getHashedPassword(),
      role: this.props.role,
      refreshToken: this.props.refreshToken,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      isPasswordCodeVerified: this.props.isPasswordCodeVerified,
    };
  }

  private copy(updates: Partial<UserProps>): User {
    return new User(
      {
        ...this.props,
        ...updates,
        updatedAt: new Date(),
      },
      this.isNew,
    );
  }

  private IsSame(oldValue: string, newValue: string): boolean {
    return oldValue.trim() === newValue.trim();
  }
}
