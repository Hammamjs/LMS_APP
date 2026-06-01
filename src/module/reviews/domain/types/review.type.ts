import { PaginationParams } from '@/core';
import { Rating } from '../value-objects/rating.vo';
import { ReviewText } from '../value-objects/review-text.vo';

export type ReviewState = {
  id: string;
  review: ReviewText;
  rating: Rating;
  createdAt: number;
  updatedAt: number;
  courseId: string;
  userId: string;
  isDeleted: boolean;
};

export type CreateReviewProps = {
  review: ReviewText;
  rating: Rating;
  userId: string;
  courseId: string;
};

export interface PaginationReviewParams extends PaginationParams {
  courseId: string;
}
