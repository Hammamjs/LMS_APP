import { UserRole } from '@/module/users/domain/interface/role.interface';

export class UpdateUserParams {
  constructor(
    public readonly id?: string,
    public readonly email?: string,
    public readonly username?: string,
    public readonly role?: UserRole,
    public readonly phone?: string,
  ) {}
}
