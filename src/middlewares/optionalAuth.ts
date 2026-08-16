import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { IJwtPayload } from './auth.middleware';

const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as IJwtPayload;
      req.user = decoded;
    } catch {
      // Token invalid or expired — silently continue without populating req.user
    }
  }
  next();
};

export default optionalAuth;
