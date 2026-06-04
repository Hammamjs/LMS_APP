import { PaginationParams } from '@/core';
import { Rating } from '../value-objects/rating.vo';
import { ContentText } from '../value-objects/review-text.vo';

export type ReviewState = {
  id: string;
  content: ContentText;
  rating: Rating;
  createdAt: number;
  updatedAt: number;
  courseId: string;
  userId: string;
  deletedAt: number | null;
};

export type CreateReviewProps = {
  content: ContentText;
  rating: Rating;
  userId: string;
  courseId: string;
};

export interface PaginationReviewParams extends PaginationParams {
  courseId: string;
}
