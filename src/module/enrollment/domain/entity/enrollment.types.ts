import { PaginationParams } from '@/core';
import { Course } from '@/module/courses';

export type Status = 'ACTIVE' | 'COMPLETED' | 'REFUND';

export type EnrollmentState = {
  id: string;
  userId: string;
  courseId: string;

  course: Course | null;

  totalLessonsCount: number;

  completedLessonsIds: string[];

  enrolledAt: Date;
  status: Status;
  createdAt: Date;
};

export interface EnrollmentProps {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: Date;
  completedLessonsIds: string[];
  status: Status;
  course: Course | null;
  progressPercentage: number;
}

export interface EnrollmentPaginationResult extends PaginationParams {
  userId: string;
  courseId?: string;
}
