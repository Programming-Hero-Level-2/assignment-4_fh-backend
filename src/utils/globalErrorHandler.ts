import { NextFunction, Request, Response } from 'express';
import { ApiError } from './ApiError';

/**
 * Express global error handler that formats API error responses.
 *
 * @param err - Error instance (preferably ApiError with statusCode).
 * @param _req - Express request (unused).
 * @param res - Express response used to send the error payload.
 * @param _next - Express next function (unused).
 * @returns JSON response with success flag, message, and optional error details.
 */
export const globalErrorHandler = (
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Error!!:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong';

  return res.status(statusCode).json({
    code: statusCode,
    success: false,
    message: message,
    // error: process.env.NODE_ENV === 'development' ? err : undefined,
  });
};
