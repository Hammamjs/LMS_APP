import { Transform, Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, Max, Min } from 'class-validator';
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
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') {
      return undefined;
    }

    const map: Record<string, Level> = {
      beginner: Level.Beginner,
      intermediate: Level.Intermediate,
      advanced: Level.Advanced,
    };

    return map[value?.toLowerCase()];
  })
  @IsEnum(Level)
  level?: Level;
}
