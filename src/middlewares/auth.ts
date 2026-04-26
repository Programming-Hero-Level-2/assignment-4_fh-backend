import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { verifyToken } from '../utils/token';
import { ApiError } from '../utils/ApiError';
import { prisma } from '../lib/prisma';
import { User } from '../modules/user/user.validation';
import { userService } from '../modules/user/user.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';

export interface AuthUser {
  userId: string;
  role: string;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      providerId?: string;
    }
  }
}

export const authenticate = asyncHandler(async (req, _res, next) => {
  const accessToken = req.headers.authorization?.replace('Bearer ', '');
  console.log('Access token from header:', accessToken);
  if (!accessToken) {
    return next(new ApiError(401, 'Unauthorized: No token provided'));
  }

  const decoded = verifyToken({ token: accessToken }) as JwtPayload;

  if (!decoded) {
    throw new ApiError(401, 'Unauthenticated: No active session found');
  }

  const user = await userService.findById(decoded.userId);

  if (!user) {
    throw new ApiError(401, 'Unauthenticated: User does not exist');
  }

  if (user.status !== 'ACTIVE') {
    throw new ApiError(403, 'Forbidden: User account is not active');
  }

  req.user = { userId: user.id, role: user.role } as AuthUser;
  next();
});

export const requireRole =
  (...roles: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new ApiError(401, 'Unauthorized'));
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Forbidden: Insufficient permissions'));
    }
    next();
  };

export const attachProviderId = asyncHandler(async (req, res, next) => {
  if (!req.user) return next(new ApiError(401, 'Unauthorized'));

  const profile = await prisma.providerProfile.findUnique({
    where: { ownerId: req.user.userId },
    select: { id: true },
  });

  if (!profile) {
    return next(new ApiError(404, 'Provider profile not found for this user'));
  }

  req.providerId = profile?.id;
  next();
});
