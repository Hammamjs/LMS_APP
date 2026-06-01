import { Type } from 'class-transformer';
import { IsNumber, IsString, Max, Min, MinLength } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  @MinLength(3, { message: 'Review must be at least 3 characters' })
  review!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Rating must be at least 1 as rate' })
  @Max(5, { message: 'Rating cannot exccede 5 as rate' })
  rating!: number;
}
