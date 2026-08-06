import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';

export const notFound = (req: Request, _res: Response, next: NextFunction) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction) => {
  let statusCode = 500;
  let message = 'Internal server error';

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    logger.warn({ err, path: req.originalUrl }, 'Request failed');
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = err.issues.map((issue) => issue.message).join(', ');
    logger.warn({ err: { issues: err.issues }, path: req.originalUrl }, 'Request validation failed');
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 409;
      message = 'This record already exists.';
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Record not found.';
    } else {
      message = 'Database error occurred.';
    }
    logger.error({ err, path: req.originalUrl }, 'Database error');
  } else if (err instanceof Error) {
    message = err.message;
    logger.error({ err: { message: err.message, stack: err.stack }, path: req.originalUrl }, 'Unexpected error');
  } else {
    logger.error({ err, path: req.originalUrl }, 'Unknown error');
  }

  return res.status(statusCode).json({ success: false, message, error: undefined });
};
