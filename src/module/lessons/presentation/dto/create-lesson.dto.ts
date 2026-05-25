import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateLessonDto {
  @IsUUID()
  courseId!: string;
  @IsString()
  @MinLength(3)
  description!: string;

  @Type(() => Number)
  @IsNumber()
  duration!: number;

  @IsOptional() // by default the lesson is paid
  isFree!: boolean;
  @IsOptional()
  url!: string;

  @IsString()
  @MinLength(5)
  title!: string;
}
