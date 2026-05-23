import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../errors/ApiError';
import { ZodError } from 'zod';
import { logger } from '@vochatix/logger';

export function errorMiddleware(
  error: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  logger.error(`${req.method} ${req.path} - ${error.message}`);

  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.errors,
    });
    return;
  }

  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
}
