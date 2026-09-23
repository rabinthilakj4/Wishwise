import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Unhandled Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected internal error occurred.';

  return sendError(res, message, statusCode, err.errors || undefined);
};
