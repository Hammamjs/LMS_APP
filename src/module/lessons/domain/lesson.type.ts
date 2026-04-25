export interface LessonState {
  id: string;
  title: string;
  url: string | null;
  video: string | null;
  rating: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;

  order: number; // for sorting
  // for preview
  isFree: boolean;

  // aggergate root
  courseId: string;
}

export interface LessonProps {
  id: string;
  title: string;
  url: string | null;
  video: string | null;
  rating: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;

  order: number; // for sorting
  // for preview
  isFree: boolean;

  // aggergate root
  courseId: string;
}
