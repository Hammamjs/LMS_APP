import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { Level } from '../../domain/course.types';

export class CreateCourseDto {
  @IsString()
  category!: string;

  @IsString()
  title!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  originalPrice!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  discountPrice: number = 0;

  @IsEnum(Level)
  level!: Level;

  @Type(() => Number)
  @IsNumber()
  duration!: number;

  @IsString()
  image!: string;

  @IsString()
  @MinLength(3)
  description!: string;

  @IsString()
  @MinLength(3)
  subtitle!: string;

  @IsArray()
  requirements!: string[];
  @IsString()
  language!: string;
  @IsArray()
  whatYouLearn!: string[];
  @IsArray()
  targetAudience!: string[];
}
