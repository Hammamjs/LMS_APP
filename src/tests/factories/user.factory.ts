import { User, UserRole } from '@/module/users';
import { IFactoryTest } from '../repository/factory.interface';

type CreateUserInput = Parameters<typeof User.create>[0];

export class UserFactory implements IFactoryTest<CreateUserInput, User> {
  private constructor() {}

  build(params?: Partial<CreateUserInput>): User {
    return UserFactory.build(params);
  }

  static build(params?: Partial<CreateUserInput>): User {
    return User.create({
      email: 'test@example.com',
      password: 'hashed-pass',
      phone: '123-456-6789',
      role: UserRole.Student,
      username: 'Mr. test',
      id: 'random-uuid',
      ...params,
    });
  }
}
