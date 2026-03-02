/**
 * Custom error type for API responses with HTTP status and payload details.
 */
class ApiError extends Error {
  /**
   * @param statusCode - HTTP status code for the error response.
   * @param message - Human-readable error message.
   * @param errors - Optional list of validation or domain errors.
   * @param data - Optional payload to include with the error.
   * @param success - Success flag (typically false for errors).
   * @param stack - Optional stack trace override.
   */

  success: boolean;
  constructor(
    public statusCode: number,
    message: string = 'Something went wrong',
    public data?: unknown | null,
    public errors?: unknown[],
    stack?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data ?? null;
    this.message = message;
    this.success = false;
    this.errors = errors ?? [];
    this.stack = stack ?? '';

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
