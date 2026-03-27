import { PrismaService } from 'src/core/database/prisma.service';
import { IUserRepository } from '../domain/repositories/user.repository';
import { User } from '../domain/entity/user.entity';
import { Injectable } from '@nestjs/common';
import { Users as PrismaUser } from '@prisma/client';
import { UserRole } from '../domain/interface/role.interface';
import { Result } from '@/core/common/result.pattern';
import { handleError } from '@/core/common/handleError';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string): Promise<Result<User | null>> {
    try {
      if (!id)
        return {
          ok: false,
          error: { type: 'VALIDATION', message: 'User id not provided' },
        };
      const user = await this.prisma.users.findUnique({ where: { id } });
      return { ok: true, value: user ? this.toEntity(user) : null };
    } catch (err: unknown) {
      return {
        ok: false,
        error: handleError(err),
      };
    }
  }

  async delete(id: string): Promise<Result<User | null>> {
    try {
      if (!id)
        return {
          ok: false,
          error: { type: 'VALIDATION', message: 'Id is required' },
        };
      const user = await this.prisma.users.delete({ where: { id } });

      return {
        ok: true,
        value: user ? this.toEntity(user) : null,
      };
    } catch (err: unknown) {
      return {
        ok: false,
        error: handleError(err),
      };
    }
  }

  // Combine both insert and update operaation
  async save(user: User): Promise<Result<User>> {
    let data: PrismaUser;

    try {
      if (user.id)
        data = await this.prisma.users.update({
          data: { ...user },
          where: { id: user.id },
        });
      else
        data = await this.prisma.users.create({
          data: { email: user.email, username: user.username, role: user.role },
        });

      return { ok: true, value: this.toEntity(data) };
    } catch (err: unknown) {
      return {
        ok: false,
        error: handleError(err),
      };
    }
  }

  async findAll(): Promise<Result<User[]>> {
    try {
      const users = await this.prisma.users.findMany();
      const usersDomain = users.map((user) => this.toEntity(user));
      return { ok: true, value: usersDomain };
    } catch (err: unknown) {
      return {
        ok: false,
        error: handleError(err),
      };
    }
  }

  async findByEmail(email: string): Promise<Result<User | null>> {
    try {
      const user = await this.prisma.users.findUnique({ where: { email } });

      return { ok: true, value: user ? this.toEntity(user) : null };
    } catch (err: unknown) {
      return {
        ok: false,
        error: handleError(err),
      };
    }
  }

  private toEntity(rawUser: PrismaUser) {
    return User.rehydrate({
      id: rawUser.id,
      email: rawUser.email,
      username: rawUser.username,
      role: rawUser.role as UserRole,
      password: rawUser.password,
      phone: rawUser.phone,
      isVerified: rawUser.isVerified,
      emailVerified: rawUser.emailVerified,
      createdAt: rawUser.createdAt,
      updatedAt: rawUser.updatedAt,
    });
  }
}
