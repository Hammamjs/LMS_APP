import { PrismaService } from 'src/core/database/prisma.service';
import { IUserRepository } from '../domain/user.repository';
import { User } from '../domain/user.entity';
import { UserRole } from '../types/UserRole.type';
import { Injectable } from '@nestjs/common';
type RawUser = {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  isVerified: boolean;
  emailVerified: Date | null;
  phone: string | null;
};

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}
  findOne: (id: string) => Promise<User | null>;
  delete: (id: string) => Promise<User | null>;

  async save(user: RawUser): Promise<User> {
    let data: RawUser;
    if (user.id)
      data = await this.prisma.users.update({
        data: {
          username: user.username,
          phone: user.phone,
          role: user.role,
          updatedAt: new Date(),
        },
        where: { id: user.id },
      });
    else data = await this.prisma.users.create({ data: user });

    return this.toEntity(data);
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.users.findMany();
    return users.map((user) => this.toEntity(user));
  }

  private toEntity(rawUser: RawUser) {
    return User.create({
      id: rawUser.id,
      username: rawUser.username,
      email: rawUser.email,
      role: rawUser.role,
      emailVerified: rawUser?.emailVerified,
      isVerified: rawUser.isVerified,
      createdAt: rawUser.createdAt,
    });
  }
}
