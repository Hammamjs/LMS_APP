import { User, UserRole } from '@/module/users';

type CreateUserInput = Parameters<typeof User.create>[0];

export class UserFactory {
  private constructor() {}

  static build(params?: Partial<CreateUserInput>): User {
    return User.create({
      email: 'test@example.com',
      password: 'hashed-pass',
      phone: '123-456-6789',
      role: UserRole.Student,
      username: 'Mr. test',
      id: 'random-uuid',
      avatar: 'not-set',
      bio: 'random bio',
      ...params,
    });
  }
}
