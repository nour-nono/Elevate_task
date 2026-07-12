import { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncFunction = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<any>;

/**
 * Wraps an async route handler to catch errors and pass them to Express error middleware
 * @param asyncFn - The async route handler function
 * @returns Express RequestHandler with error handling
 */
const asyncHandler = (asyncFn: AsyncFunction): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    asyncFn(req, res, next).catch(next);
  };
};

export default asyncHandler;
