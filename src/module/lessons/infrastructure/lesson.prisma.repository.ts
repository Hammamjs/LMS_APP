import { Injectable } from '@nestjs/common';
import { ILessonRepository } from '../domain/repository/lesson.repository.interface';
import {
  PaginationResult,
  PrismaService,
  ErrorMapper,
  paginate,
  failure,
  Errors,
  Result,
} from '@/core';
import { Lesson } from '../domain/entity/lesson.entity';
import { Prisma } from '@prisma/client';
import { LessonMapper } from './mapper/lesson.mapper';
import { Lesson as PrismaLesson } from '@prisma/client';
import { LessonPaginationParams } from '../domain/lesson.type';

@Injectable()
export class LessonPrismaRepository implements ILessonRepository {
  private _entityName: string = 'Lesson';

  private _errors = {
    NOT_FOUND: `Lesson not found`,
  };

  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    params: LessonPaginationParams,
  ): Promise<Result<PaginationResult<Lesson>>> {
    try {
      const { search, limit, page, courseId } = params;
      const where: Prisma.LessonWhereInput = {
        isDeleted: false,
        ...(courseId && { courseId }),
        ...(search && {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        }),
      };

      const paginateData = await paginate(
        { limit, page },
        (args) =>
          this.prisma.lesson.findMany({
            ...args,
            where,
          }),
        (args) => this.prisma.lesson.count({ ...args, where }),
        (row) => LessonMapper.toDomain(row),
      );
      return paginateData;
    } catch (err: unknown) {
      return ErrorMapper.toResult(err, this._entityName);
    }
  }

  async findById(id: string): Promise<Result<Lesson>> {
    try {
      const result = await this.prisma.lesson.findUnique({ where: { id } });
      if (!result) return failure(Errors.notFound(this._errors.NOT_FOUND));
      const lessonToDomain = LessonMapper.toDomain(result);

      return Result.ok(lessonToDomain);
    } catch (err: unknown) {
      return ErrorMapper.toResult(err, this._entityName);
    }
  }

  async save(props: Lesson): Promise<Result<Lesson>> {
    try {
      let data: PrismaLesson;
      if (props.isNew) {
        data = await this.prisma.lesson.create({ data: props.toPersistence });
      } else
        data = await this.prisma.lesson.update({
          where: { id: props.id },
          data: props.toPersistence,
        });
      const toDomain = LessonMapper.toDomain(data);
      return Result.ok(toDomain);
    } catch (err) {
      return ErrorMapper.toResult(err, this._entityName);
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      const result = await this.prisma.lesson.delete({ where: { id } });
      if (!result) return Result.fail(Errors.notFound(this._errors.NOT_FOUND));
      return Result.ok(undefined);
    } catch (err) {
      return ErrorMapper.toResult(err, this._entityName);
    }
  }

  async findLastOrderByCourse(courseId: string): Promise<Result<number>> {
    try {
      const result = await this.prisma.lesson.findFirst({
        where: { courseId },
        orderBy: { order: 'desc' },
        select: { order: true },
      });
      const lastOrder = result?.order ?? 0;

      return Result.ok(lastOrder);
    } catch (err) {
      return ErrorMapper.toResult(err, this._entityName);
    }
  }
}
