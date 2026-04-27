import { IUseCase } from '@/core/common/domain/use-case-interface';
import type {
  IUserRepository,
  UserPaginationParams,
} from '@/module/users/domain/repositories/user.repository.interface';
import { Inject, Injectable } from '@nestjs/common';
import { Result } from '@/core/common/domain/result.pattern';
import { IUSER_REPOSITORY } from '@/module/users/domain/constants/injection.token';
import { ResponseBuilder } from '@/core';
import {
  TUserResponse,
  UserResponseMapper,
} from '../../mapper/user-response.mapper';

@Injectable()
export class FindAllUsersUseCase implements IUseCase<
  UserPaginationParams,
  Promise<Result<TUserResponse>>
> {
  constructor(
    @Inject(IUSER_REPOSITORY) private readonly userRepo: IUserRepository,
  ) {}
  async execute(dto: UserPaginationParams): Promise<Result<TUserResponse>> {
    const result = await this.userRepo.findAll(dto);

    if (!result.ok) return result;

    const { data, meta } = result.value;

    const response = ResponseBuilder.paginateMapped(
      data,
      meta,
      UserResponseMapper.toResponse,
    );

    return Result.ok(response);
  }
}
