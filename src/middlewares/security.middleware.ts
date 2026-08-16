import helmet from 'helmet';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import cors from 'cors';
import { RequestHandler } from 'express';
import { logger } from '@/utils/logger';

/**
 * 1. Helmet Custom Content Security Policy & Security Headers
 */
export const helmetSecurity = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
});

/**
 * 2. HTTP Parameter Pollution (HPP) Prevention
 */
export const hppProtection = hpp({
  whitelist: ['role', 'status', 'page', 'limit', 'sort', 'search', 'fields'],
});

/**
 * 3. NoSQL Injection Sanitizer (express-mongo-sanitize)
 */
export const mongoSanitizer = mongoSanitize({
  allowDots: false,
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    logger.warn({ ip: req.ip, key }, 'NoSQL Injection attempt detected and sanitized');
  },
}) as unknown as RequestHandler;

/**
 * 4. Strict CORS Security Configuration
 */
export const corsSecurity = cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
});
