import { IUseCase } from '@/core/common/domain/use-case-interface';
import type { IUserRepository } from '@/module/users/domain/repositories/user.repository.interface';
import { User } from '@/module/users/domain/entity/user.entity';
import { Inject, Injectable } from '@nestjs/common';
import { Result } from '@/core/common/domain/result.pattern';
import { IUSER_REPOSITORY } from '@/module/users/domain/constants/injection.token';

type ReturnType = Promise<
  Result<{
    data: User[];
    meta: {
      total: number;
      page: number;
      lastPage: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>
>;
type Dto = { page: number; limit: number };
@Injectable()
export class FindAllUsersUseCase implements IUseCase<Dto, ReturnType> {
  constructor(
    @Inject(IUSER_REPOSITORY) private readonly userRepo: IUserRepository,
  ) {}
  async execute(dto: Dto): ReturnType {
    const page = Math.max(Number(dto.page) || 1, 1);
    const limit = Math.max(Number(dto.limit) || 10, 1);
    const skip = (page - 1) * limit;
    const take = limit;
    const result = await this.userRepo.findAll({ skip, take });

    if (!result.ok) return result;

    const hasNext = page < result.value.total;
    const hasPrev = page > 1;

    return {
      ok: true,
      value: {
        data: result.value.users,
        meta: {
          total: result.value.total,
          page: dto.page,
          lastPage: Math.ceil(result.value.total / limit),
          hasNext,
          hasPrev,
        },
      },
    };
  }
}
