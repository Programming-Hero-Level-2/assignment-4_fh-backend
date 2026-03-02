/**
 * Standard API response wrapper for successful operations.
 * Automatically sets success flag based on HTTP status code.
 */

/**
 * @param code - HTTP status code (success determined by code < 400).
 * @param message - Human-readable response message.
 * @param data - Response payload (can be object, array, or any serializable data).
 *
 * @example
 * ```typescript
 * return res.status(200).json(
 *   new ApiResponse(200, 'Users retrieved successfully', users)
 * );
 * ```
 */
class ApiResponse {
  success: boolean;

  constructor(
    public code: number,
    public message: string,
    public data?: unknown
  ) {
    this.success = this.code < 400;
  }
}

export { ApiResponse };
