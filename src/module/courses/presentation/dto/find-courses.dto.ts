import { Type } from 'class-transformer';
import { IsOptional, IsString, Max, Min } from 'class-validator';
import { Level } from '../../domain/types/course.types';

export class FindCoursesDto {
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Min(10)
  @Max(100)
  limit: number = 10;

  @IsOptional()
  @IsString()
  search!: string;

  @IsOptional()
  @IsString()
  category!: string;

  @IsOptional()
  @IsString()
  instructorId?: string;

  @IsOptional()
  level?: Level;
}
