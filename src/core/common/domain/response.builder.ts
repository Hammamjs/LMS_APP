type Meta = {
  page: number;
  total: number;
  limit: number;
  lastPage: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type ApiResponse<T> = {
  data: T;
};

export type ApiPaginateResponse<T> = {
  data: T[];
  meta: Meta;
};

export class ResponseBuilder {
  static single<T>(data: T): ApiResponse<T> {
    return {
      data,
    };
  }

  static paginate<T>(data: T[], meta: Meta): ApiPaginateResponse<T> {
    return {
      data,
      meta,
    };
  }

  static paginateMapped<T, R>(data: T[], meta: Meta, mapFn: (item: T) => R) {
    return {
      data: data.map(mapFn),
      meta,
    };
  }
}
