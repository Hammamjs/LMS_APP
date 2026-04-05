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
}
