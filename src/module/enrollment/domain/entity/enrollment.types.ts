import { PaginationParams } from '@/core';

export type Status = 'ACTIVE' | 'COMPLETED' | 'REFUND';

export interface EnrollmentState {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: Date;
  completedLessonsIds: string[];
  status: Status;
  progressPercentage: number;
  createdAt: Date;
}

export interface EnrollmentProps {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: Date;
  completedLessonsIds: string[];
  status: Status;
  progressPercentage: number;
}

export interface EnrollmentPaginationResult extends PaginationParams {
  userId: string;
  courseId: string;
}
