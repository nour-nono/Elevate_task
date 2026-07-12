import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import ApiError from '../utils/apiError';

type ValidationTarget = 'body' | 'query' | 'params';

export function validate(schema: Schema, target: ValidationTarget = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const data = req[target];
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      }));
      return next(ApiError.badRequest('Validation failed', details));
    }

    req[target] = value;
    next();
  };
}

export default validate;
