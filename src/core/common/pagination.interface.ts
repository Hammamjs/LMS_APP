export interface PaginationResult<T> {
  data: T[];
  meta: {
    page: number;
    total: number;
    limit: number;
    lastPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}
