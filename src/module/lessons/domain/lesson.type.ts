import { PaginationParams } from '@/core';

export interface LessonState {
  id: string;
  title: string;
  sourceLink: string | null;
  video: string | null;
  rating: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;

  order: number; // for sorting
  // for preview
  isFree: boolean;

  isDeleted: boolean;

  // aggergate root
  courseId: string;
}

export interface LessonProps {
  id: string;
  title: string;
  sourceLink: string | null;
  video: string | null;
  rating: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;

  order: number; // for sorting
  // for preview
  isFree: boolean;

  // Soft deletion
  isDeleted: boolean;

  // aggergate root
  courseId: string;
}

export type ExcludedProps =
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'rating'
  | 'isDeleted';

export interface LessonPaginationParams extends PaginationParams {
  courseId: string;
}
