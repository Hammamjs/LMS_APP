import { User } from '@/module/users';

export enum Level {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced',
}

export interface CourseState {
  id: string;
  title: string;
  originalPrice: number;
  discountPrice: number;
  duration: number;
  slug: string;
  level: Level;
  description: string;
  subtitle: string;
  rating: number;
  purchaseCount: number;
  createdAt: Date;
  updatedAt: Date;
  instructorId: string;
  image: string | null; // cover for course
  category: string;
  isDeleted: boolean;
  instructor?: User;
  lessonCount?: number;
  requirements: string[];
  language: string;
  whatYouLearn: string[];
  targetAudience: string[];

  // course rate
  reviewsCount: number;
  averageRating: number;
}

export type ExcludedFields =
  | 'createdAt'
  | 'updatedAt'
  | 'id'
  | 'slug'
  | 'rating'
  | 'purchaseCount'
  | 'isDeleted'
  | 'averageRating'
  | 'reviewsCount';
