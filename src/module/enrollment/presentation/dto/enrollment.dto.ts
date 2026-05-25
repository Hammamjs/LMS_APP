import { IsString, IsUUID } from 'class-validator';

export class EnrollmentDto {
  @IsUUID()
  courseId!: string;
  @IsString()
  userId!: string;
}
