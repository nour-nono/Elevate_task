import HttpStatus, { HttpStatusValue } from './httpStatus';

export class ApiError extends Error {
  public readonly statusCode: HttpStatusValue;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: HttpStatusValue = HttpStatus.INTERNAL_SERVER_ERROR,
    isOperational = true,
    details?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (details !== undefined) this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad Request', details?: unknown): ApiError {
    return new ApiError(message, HttpStatus.BAD_REQUEST, true, details);
  }

  static unauthorized(message = 'Unauthorized'): ApiError {
    return new ApiError(message, HttpStatus.UNAUTHORIZED, true);
  }

  static forbidden(message = 'Forbidden'): ApiError {
    return new ApiError(message, HttpStatus.FORBIDDEN, true);
  }

  static notFound(message = 'Not Found'): ApiError {
    return new ApiError(message, HttpStatus.NOT_FOUND, true);
  }

  static conflict(message = 'Conflict'): ApiError {
    return new ApiError(message, HttpStatus.CONFLICT, true);
  }

  static tooManyRequests(
    message = 'Too many requests, please try again later',
  ): ApiError {
    return new ApiError(message, HttpStatus.TOO_MANY_REQUESTS, true);
  }

  static internal(message = 'Internal Server Error'): ApiError {
    return new ApiError(message, HttpStatus.INTERNAL_SERVER_ERROR, false);
  }
}

export default ApiError;
