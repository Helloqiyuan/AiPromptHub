export interface ApiSuccess<T> {
  code: number;
  message: string;
  data: T;
}

export interface ApiErrorPayload {
  code: number;
  message: string;
  data: unknown;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PagedData<T> {
  list: T[];
  pagination: Pagination;
}
