import { Response } from 'express';
import { CustomError } from '../error/customError';
import { normalizeError } from './errors'; // 👈 import
import logger from '../config/logger';

export function handleError(res: Response, error: unknown, contextMessage: string): void {
  const err = normalizeError(error); // 👈 normalize once here

  if (err instanceof CustomError) {
    res.status(err.statusCode).json({
      message: err.message,
    });
  } else {
    logger.error(`Unexpected error in ${contextMessage}: ${err}`);
    res.status(500).json({
      message: 'Internal Server Error, Please Try Again',
    });
  }
}
