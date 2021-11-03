interface PaginateQuery {
    search?: string;
    page?: number;
    limit?: number;
  }
  
  interface PaginateResponse<T> {
    totalDocs: number;
    totalPages: number;
    page: number;
    limit: number;
    docs: T[];
  }
  