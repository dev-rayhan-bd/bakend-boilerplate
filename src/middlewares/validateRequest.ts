import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
import { catchAsync } from '@/utils/catchAsync';

export const validateRequest = (schema: AnyZodObject) => {
  return catchAsync(async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const parsed = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
      cookies: req.cookies,
    });

    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;

    next();
  });
};
