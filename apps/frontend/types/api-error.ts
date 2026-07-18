// Mirrors com.notebook.api.exception.ErrorResponse — see docs/API.md "Standard Error Shape"
export interface ApiErrorResponse {
  error: string;
  message?: string;
  fields?: Record<string, string>;
  retryAfterSeconds?: number;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: ApiErrorResponse
  ) {
    super(body.message ?? body.error);
  }
}
