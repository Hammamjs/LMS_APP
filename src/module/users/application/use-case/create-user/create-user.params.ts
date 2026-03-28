import { UserRole } from '@/module/users/domain/interface/role.interface';

export class CreateUserParams {
  constructor(
    public readonly email: string,
    public readonly username: string,
    public readonly role: UserRole | null,
    public readonly phone: string | null,
    public readonly password: string,
  ) {}
}
