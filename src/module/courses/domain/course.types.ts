export interface CourseState {
  id: string;
  title: string;
  price: number;
  hours: number;
  slug: string;
  description: string;
  rating: number;
  purchaseCount: number;
  createdAt: Date;
  updatedAt: Date;
  instructorId: string;
  image: string | null; // cover for course
  category: string;
  isDeleted: boolean; //
}

export interface CourseProps {
  id: string;
  title: string;
  price: number;
  hours: number;
  slug: string;
  description: string;
  rating: number;
  purchaseCount: number;
  createdAt: Date;
  updatedAt: Date;
  instructorId: string;
  image: string | null;
  category: string;
  isDeleted: boolean; //
}

export type ExcludedFields =
  | 'createdAt'
  | 'updatedAt'
  | 'id'
  | 'slug'
  | 'rating'
  | 'purchaseCount'
  | 'isDeleted';
