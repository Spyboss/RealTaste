import rateLimit from 'express-rate-limit';
import { config } from '../config';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs, // 15 minutes
  max: config.rateLimit.maxRequests, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip trust proxy validation in development
  validate: config.nodeEnv === 'development' ? false : undefined,
});

// Strict rate limiter for order creation
export const orderLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // limit each IP to 5 order attempts per 5 minutes
  message: {
    success: false,
    error: 'Too many order attempts. Please wait 5 minutes before trying again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for authenticated users (they have account-based limits)
  skip: (req) => !!req.user,
  // Skip trust proxy validation in development
  validate: config.nodeEnv === 'development' ? false : undefined,
});

// Auth rate limiter for login attempts
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth attempts per 15 minutes
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip trust proxy validation in development
  validate: config.nodeEnv === 'development' ? false : undefined,
});

// Admin action rate limiter
export const adminLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit admin actions to 30 per minute
  message: {
    success: false,
    error: 'Too many admin actions. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip trust proxy validation in development
  validate: config.nodeEnv === 'development' ? false : undefined,
});
