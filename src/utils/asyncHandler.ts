import { NextFunction, Request, Response } from 'express';
import { ApiError } from './ApiError';

/**
 * Higher-order function that wraps async Express route handlers to catch errors automatically.
 * Prevents the need for try-catch blocks in every async controller.
 *
 * @param fn - Async Express route handler function.
 * @returns Wrapped handler that catches and formats async errors into JSON responses.
 *
 * @example
 * ```typescript
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await User.findMany();
 *   res.json({ success: true, data: users });
 * }));
 * ```
 */
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      const err = error as ApiError;
      // res.status(err.statusCode || 500).json({
      //   code: err.statusCode || 500,
      //   success: false,
      //   message: err.message || 'Something went wrong',
      //   errors: err.errors,
      // });

      next(err);
    }
  };

export { asyncHandler };
