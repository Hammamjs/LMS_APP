import { PrismaService } from '@/core/database/prisma.service';
import { ICourseRepository } from '../domain/repository/course.repository.interface';
import { Result } from '@/core/common/domain/result.pattern';
import { Course } from '../domain/entity/course.entity';
import {
  PaginationParams,
  PaginationResult,
} from '@/core/common/domain/pagination.interface';
import { paginate } from '@/core/database/prisma-helper';
import { CourseMapper } from './mapper/course.mapper';
import { Errors, failure } from '@/core/common/domain/err.utils';
import { Prisma, Courses as PrismaCourse } from '@prisma/client';
import { ErrorMapper } from '@/core/database/prisma-global.mapper';
import { Injectable } from '@nestjs/common';
@Injectable()
export class CourseRepository implements ICourseRepository {
  constructor(private readonly prisma: PrismaService) {}

  readonly _entityName: string = 'Courses';

  async findAll(
    params: PaginationParams,
  ): Promise<Result<PaginationResult<Course>>> {
    const { limit, page, search, category, instructorId } = params;
    try {
      const where: Prisma.CoursesWhereInput = {
        isDeleted: false,
        // Filter by instructor
        ...(instructorId && { instructorId }),
        // Filter by category
        ...(category && { category }),
        ...(search && {
          title: {
            mode: 'insensitive',
            contains: search,
          },
        }),
      };

      const paginationData = await paginate(
        { limit, page },
        (args) =>
          this.prisma.courses.findMany({
            ...args,
            where,
            orderBy: { createdAt: 'desc' },
          }),
        (args) => this.prisma.courses.count({ ...args, where }),
        (row) => CourseMapper.toDomain(row),
      );

      return paginationData;
    } catch (err: unknown) {
      return ErrorMapper.toResult(err, this._entityName);
    }
  }

  async findById(id: string): Promise<Result<Course>> {
    try {
      const result = await this.prisma.courses.findUnique({
        where: { id, isDeleted: false },
      });

      if (!result) return failure(Errors.notFound('Course not found'));

      const domainData = CourseMapper.toDomain(result);

      return Result.ok(domainData);
    } catch (err: unknown) {
      return ErrorMapper.toResult(err, this._entityName);
    }
  }

  async save(props: Course): Promise<Result<Course>> {
    try {
      let data: PrismaCourse;

      if (props.isNew)
        data = await this.prisma.courses.create({
          data: props.toPersistence(),
        });
      else
        data = await this.prisma.courses.update({
          data: props.toPersistence(),
          where: { id: props.getId() },
        });

      const domain = CourseMapper.toDomain(data);

      return Result.ok(domain);
    } catch (err: unknown) {
      return ErrorMapper.toResult(err, this._entityName);
    }
  }

  async findBySlug(slug: string): Promise<Result<Course>> {
    try {
      const result = await this.prisma.courses.findUnique({ where: { slug } });

      if (!result) return failure(Errors.notFound('Course not found'));

      const domain = CourseMapper.toDomain(result);

      return Result.ok(domain);
    } catch (err: unknown) {
      console.error(err);
      return ErrorMapper.toResult(err, this._entityName);
    }
  }

  async findByInstructorId(
    instructorId: string,
    params?: PaginationParams,
  ): Promise<Result<PaginationResult<Course>>> {
    try {
      const paginationData = await paginate(
        params ?? { limit: 20, page: 1 },
        (args) =>
          this.prisma.courses.findMany({ ...args, where: { instructorId } }),
        (args) =>
          this.prisma.courses.count({ ...args, where: { instructorId } }),
        (row) => CourseMapper.toDomain(row),
      );

      if (!paginationData.ok)
        return failure(Errors.notFound('Courses not found'));

      return paginationData;
    } catch (err: unknown) {
      return ErrorMapper.toResult(err, this._entityName);
    }
  }

  async findByCategory(
    category: string,
    params?: PaginationParams,
  ): Promise<Result<PaginationResult<Course>>> {
    try {
      const paginationData = await paginate(
        params ?? { limit: 20, page: 1 },
        (args) =>
          this.prisma.courses.findMany({ ...args, where: { category } }),
        (args) => this.prisma.courses.count({ ...args, where: { category } }),
        (row) => CourseMapper.toDomain(row),
      );

      if (!paginationData.ok)
        return failure(Errors.notFound('Course not found'));

      return paginationData;
    } catch (err: unknown) {
      return ErrorMapper.toResult(err, this._entityName);
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      const result = await this.prisma.courses.delete({ where: { id } });
      if (!result)
        return failure(Errors.notFound('Course not found operation failed'));

      return Result.ok(undefined);
    } catch (err: unknown) {
      return ErrorMapper.toResult(err, this._entityName);
    }
  }
}
