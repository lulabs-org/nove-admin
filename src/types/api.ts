/**
 * Generic API response wrapper for successful responses
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

/**
 * API error details
 */
export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
  details?: unknown;
}

/**
 * API error response wrapper
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
  timestamp: string;
}
