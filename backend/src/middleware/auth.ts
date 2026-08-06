import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../utils/token';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { logger } from '../config/logger';

export const authenticate = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    logger.warn({ path: req.originalUrl, ip: req.ip }, 'Authentication failed: missing bearer token');
    throw new ApiError(401, 'Authentication required. Please log in.');
  }

  const token = header.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.userId, role: payload.role };
    req.log = req.log.child({ userId: payload.userId, role: payload.role });
    next();
  } catch {
    logger.warn({ path: req.originalUrl, ip: req.ip }, 'Authentication failed: invalid or expired token');
    throw new ApiError(401, 'Invalid or expired token.');
  }
});

export const authorizeAdmin = (req: Request, _res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    logger.warn({ userId: req.user?.id, path: req.originalUrl, role: req.user?.role }, 'Admin access denied');
    throw new ApiError(403, 'Admin access required.');
  }
  next();
};
