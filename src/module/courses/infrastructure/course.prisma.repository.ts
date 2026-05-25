import { PrismaService } from '@/core/database/prisma.service';
import { Course } from '../domain/entity/course.entity';
import {
  PaginationParams,
  PaginationResult,
  paginate,
  Errors,
  failure,
  ErrorMapper,
  Result,
} from '@/core';
import { CourseMapper, CourseWithInstructorData } from './mapper/course.mapper';
import { Prisma, Course as PrismaCourse } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { ICourseRepository } from '../domain/repository/course.repository.interface';
@Injectable()
export class CourseRepository implements ICourseRepository {
  constructor(private readonly prisma: PrismaService) {}

  readonly _entityName: string = 'Courses';

  async findAllCategories(): Promise<Result<string[]>> {
    try {
      const courseCategories = await this.prisma.course.findMany({
        where: { isDeleted: false },
        distinct: ['category'],
        select: { category: true },
      });

      if (!courseCategories.length)
        return Result.fail(Errors.notFound('Categories not found yet'));

      const formattedCategories = courseCategories.map((c) => c.category);

      return Result.ok(formattedCategories);
    } catch (err) {
      return ErrorMapper.toResult(err, this._entityName);
    }
  }

  async findAll(
    params: PaginationParams,
  ): Promise<Result<PaginationResult<CourseWithInstructorData>>> {
    // 💡 Updated Return Type signature
    const { limit, page, search, category, instructorId } = params;
    try {
      const where: Prisma.CourseWhereInput = {
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
          this.prisma.course.findMany({
            ...args,
            where,
            orderBy: { createdAt: 'desc' },
            include: { instructor: true },
          }),
        (args) => this.prisma.course.count({ ...args, where }),
        // 💡 THE FIX: Update this line to use your new mapper method
        (row) => CourseMapper.toDomainWithInstructor(row),
      );

      return paginationData;
    } catch (err: unknown) {
      return ErrorMapper.toResult(err, this._entityName);
    }
  }

  async findById(id: string): Promise<Result<CourseWithInstructorData>> {
    try {
      const result = await this.prisma.course.findUnique({
        where: { id, isDeleted: false },
        include: {
          instructor: true,
          _count: {
            select: { lessons: true },
          },
        },
      });

      if (!result) {
        return Result.fail(Errors.notFound('Course not found'));
      }

      const domainData = CourseMapper.toDomainWithInstructor(result);

      return Result.ok(domainData);
    } catch (err: unknown) {
      const errorInstance = err instanceof Error ? err : new Error(String(err));
      return ErrorMapper.toResult(errorInstance, this._entityName);
    }
  }

  async save(props: Course): Promise<Result<Course>> {
    try {
      let data: PrismaCourse;

      if (props.isNew)
        data = await this.prisma.course.create({
          data: props.toPersistence,
        });
      else
        data = await this.prisma.course.update({
          data: props.toPersistence,
          where: { id: props.id },
        });

      const domain = CourseMapper.toDomain(data);

      return Result.ok(domain);
    } catch (err: unknown) {
      return ErrorMapper.toResult(err, this._entityName);
    }
  }

  async findBySlug(slug: string): Promise<Result<CourseWithInstructorData>> {
    try {
      const result = await this.prisma.course.findUnique({
        where: { slug },
        include: {
          instructor: true,
          _count: {
            select: {
              lessons: true,
            },
          },
        },
      });

      if (!result) return failure(Errors.notFound('Course not found'));

      const domain = CourseMapper.toDomainWithInstructor(result);

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
          this.prisma.course.findMany({ ...args, where: { instructorId } }),
        (args) =>
          this.prisma.course.count({ ...args, where: { instructorId } }),
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
        (args) => this.prisma.course.findMany({ ...args, where: { category } }),
        (args) => this.prisma.course.count({ ...args, where: { category } }),
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
      const result = await this.prisma.course.delete({ where: { id } });
      if (!result)
        return failure(Errors.notFound('Course not found operation failed'));

      return Result.ok(undefined);
    } catch (err: unknown) {
      return ErrorMapper.toResult(err, this._entityName);
    }
  }
}
