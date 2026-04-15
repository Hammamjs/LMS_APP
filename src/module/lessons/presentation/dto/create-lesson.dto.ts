import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateLessonParams {
  @IsUUID()
  courseId!: string;
  @IsString()
  @MinLength(3)
  description!: string;

  @IsOptional() // by default the lesson is paid
  isFree!: boolean;
  @IsOptional()
  sourceLink!: string;
  @IsOptional()
  video!: string | null;
  @IsString()
  @MinLength(5)
  title!: string;
}
