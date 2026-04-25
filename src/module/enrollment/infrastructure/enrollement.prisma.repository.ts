import {
  ErrorMapper,
  Errors,
  paginate,
  PaginationResult,
  PrismaService,
  Result,
  TransactionContext,
} from '@/core';
import { IEnrollmentRepository } from '../domain/repository/enrollment.repository.interface';
import { Enrollment } from '../domain/entity/enrollment.entity';
import { EnrollmentMapper } from './mapper/enrollment.mapper';
import { EnrollmentPaginationResult } from '../domain/entity/enrollment.types';
import { Prisma, Enrollment as PrismaEnrollment } from '@prisma/client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EnrollmentPrimsaRepository implements IEnrollmentRepository {
  private _entityName = 'Enrollment';
  constructor(
    private readonly prisma: PrismaService,
    private readonly context: TransactionContext,
  ) {}

  private get _db() {
    const store = this.context.getStore();
    return store?.tx || this.prisma;
  }

  async findAllByCourseId(courseId: string): Promise<Result<Enrollment[]>> {
    try {
      const result = await this._db.enrollment.findMany({
        where: { courseId },
      });

      if (!result)
        Result.fail(Errors.notFound('No users enrolled at this course yet'));

      const toDomain = result.map(EnrollmentMapper.toDomain);

      return Result.ok(toDomain);
    } catch (err) {
      return ErrorMapper.toResult(err, this._entityName);
    }
  }

  async findById(id: string): Promise<Result<Enrollment>> {
    try {
      const result = await this._db.enrollment.findFirst({ where: { id } });

      if (!result) return Result.fail(Errors.notFound('No enrollment found'));
      const toDomain = EnrollmentMapper.toDomain(result);
      return Result.ok(toDomain);
    } catch (err) {
      return ErrorMapper.toResult(err, this._entityName);
    }
  }

  // get all enrollment for user
  async findByUser(
    params: EnrollmentPaginationResult,
  ): Promise<Result<PaginationResult<Enrollment>>> {
    const { limit, page, userId } = params;
    const where: Prisma.EnrollmentWhereInput = {
      ...(userId && { userId }),
    };
    try {
      const paginationData = await paginate(
        { page, limit },
        (args) => this._db.enrollment.findMany({ ...args, where }),
        (args) => this._db.enrollment.count({ ...args, where }),
        (row) => EnrollmentMapper.toDomain(row),
      );

      if (!paginationData.ok)
        return Result.fail(Errors.notFound('No enrollment for this user'));

      return paginationData;
    } catch (err) {
      return ErrorMapper.toResult(err, this._entityName);
    }
  }

  async findByCourseAndUser(
    userId: string,
    courseId: string,
  ): Promise<Result<Enrollment>> {
    try {
      const result = await this._db.enrollment.findUnique({
        where: {
          userId_courseId: { userId, courseId },
        },
      });

      if (!result) return Result.fail(Errors.notFound('No enrollment found'));

      const toDomain = EnrollmentMapper.toDomain(result);

      return Result.ok(toDomain);
    } catch (err) {
      return ErrorMapper.toResult(err, this._entityName);
    }
  }

  async save(enrollment: Enrollment): Promise<Result<Enrollment>> {
    let data: PrismaEnrollment;
    try {
      if (enrollment.isNew) {
        data = await this._db.enrollment.create({
          data: enrollment.toPersistence(),
        });
      } else {
        data = await this._db.enrollment.update({
          where: { id: enrollment.getId() },
          data: enrollment.toPersistence(),
        });
      }

      const toDomain = EnrollmentMapper.toDomain(data);
      return Result.ok(toDomain);
    } catch (err) {
      return ErrorMapper.toResult(err, this._entityName);
    }
  }
}
