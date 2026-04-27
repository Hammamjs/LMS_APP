import { Type } from 'class-transformer';
import { IsNumber, IsString, Min, MinLength } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  category!: string;

  @IsString()
  title!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  price!: number;

  @Type(() => Number)
  @IsNumber()
  hours!: number;

  @IsString()
  image!: string;

  @IsString()
  @MinLength(3)
  description!: string;
}
