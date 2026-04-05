import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../error/customError';
import logger from '../config/logger';

export function errorHandler(
  err: Error | CustomError, // ✅ proper type instead of any
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof CustomError) {
    res.status(err.statusCode).json({
      message: err.message,
    });
  } else {
    logger.error(`Unexpected error: ${err}`);
    res.status(500).json({
      message: 'Internal Server Error.Please try again later',
    });
  }
}
