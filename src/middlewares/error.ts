import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import { MongoServerError } from 'mongodb';
import ApiError from '../utils/apiError';
import HttpStatus from '../utils/httpStatus';
import logger from '../utils/logger';
import env from '../config/env';

function getStatusCode(err: unknown): number {
  if (err instanceof ApiError) return err.statusCode;
  if (
    err instanceof MongooseError.ValidationError ||
    err instanceof MongooseError.CastError
  )
    return HttpStatus.BAD_REQUEST;
  if (err instanceof MongoServerError && err.code === 11000)
    return HttpStatus.CONFLICT;
  return HttpStatus.INTERNAL_SERVER_ERROR;
}

function getMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof MongooseError.ValidationError) {
    return Object.values(err.errors)
      .map((e) => e.message)
      .join('; ');
  }
  if (err instanceof MongooseError.CastError) {
    return `Invalid value for field "${err.path}"`;
  }
  if (err instanceof MongoServerError && err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return `Duplicate value for ${field}. Resource already exists.`;
  }
  if (err instanceof Error) return err.message;
  return 'Internal Server Error';
}

export function notFoundHandler(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  next(
    ApiError.notFound(
      `This route is not exist: ${req.method} ${req.originalUrl}`,
    ),
  );
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode = getStatusCode(err);
  const message = getMessage(err);

  const isOperational =
    err instanceof ApiError ? err.isOperational : statusCode < 500;

  if (!isOperational) {
    logger.error('Unhandled error', err);
  }

  const response: Record<string, unknown> = {
    success: false,
    message,
  };

  if (err instanceof ApiError && err.details !== undefined) {
    response.details = err.details;
  }

  if (
    env.nodeEnv !== 'production' &&
    err instanceof Error &&
    statusCode >= 500
  ) {
    logger.error('Error stack trace:', err.stack);
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

export default errorHandler;
