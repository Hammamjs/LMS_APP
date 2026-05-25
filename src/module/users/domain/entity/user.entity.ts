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
        isPasswordCodeVerified: false,
        passwordUpdatedAt: new Date(),
        bio: data.bio,
      },
      true, // for new users
    );
  }

  public get id(): string {
    return this.props.id;
  }

  public get avatar(): string | null {
    return this.props.avatar;
  }

  public get email(): string {
    return this.props.email;
  }

  public get username(): string {
    return this.props.username;
  }

  public get phone(): string | null {
    return this.props.phone;
  }

  public get role(): UserRole {
    return this.props.role;
  }

  public get bio(): string | null {
    return this.props.bio;
  }

  public get isVerified(): boolean {
    return this.props.isVerified;
  }

  public get hashedPassword(): string {
    return this.props.password;
  }

  public get refreshToken(): string | null {
    return this.props.refreshToken || null;
  }

  public get emailVerified(): Date | null {
    return this.props.emailVerified;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public get isPasswordCodeVerified(): boolean {
    return this.props.isPasswordCodeVerified;
  }

  public get passwordUpdatedAt(): Date | null {
    return this.props.passwordUpdatedAt;
  }

  public withAvatar(avatar: string | null): User {
    if (!avatar || avatar.trim() == '')
      throw new Error('avatar image not valid');
    return this.copy({ avatar });
  }

  public setBio(bio: string): User {
    if (!bio || bio.trim() == '')
      throw new Error('Bio description cannot be empty');

    return this.copy({ bio });
  }

  public withUsername(newUsername: string): User {
    if (!newUsername || this.IsSame(this.props.username, newUsername))
      return this;
    if (!newUsername.trim()) throw new InvalidUsernameError();

    return this.copy({ username: newUsername.trim() });
  }

  public withPassword(newHashedPassword: string): User {
    return this.copy({
      password: newHashedPassword,
      passwordUpdatedAt: new Date(),
    });
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

  public isInstructor(): boolean {
    return this.props.role == UserRole.Instructor;
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
      password: this.hashedPassword,
      role: this.props.role,
      refreshToken: this.props.refreshToken,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      isPasswordCodeVerified: this.props.isPasswordCodeVerified,
      bio: this.props.bio,
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
