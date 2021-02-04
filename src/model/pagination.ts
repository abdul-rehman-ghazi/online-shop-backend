export interface PaginationRequest {
  limit: number;
  page: number;
}

export interface PaginationResponse {
  total: number;
  page: number;
  lastPage: number;
}
