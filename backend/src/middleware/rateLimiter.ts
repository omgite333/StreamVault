import rateLimit from 'express-rate-limit';
import { logger } from '../config/logger';

const standardMessage = { success: false, message: 'Too many requests. Please try again later.' };

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { ...standardMessage, message: 'Too many login attempts. Please try again later.' },
  handler: (req, res) => {
    logger.warn({ ip: req.ip, path: req.originalUrl }, 'Auth rate limit exceeded');
    res.status(429).json({ ...standardMessage, message: 'Too many login attempts. Please try again later.' });
  },
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 500,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: standardMessage,
  handler: (req, res) => {
    logger.warn({ ip: req.ip, path: req.originalUrl }, 'API rate limit exceeded');
    res.status(429).json(standardMessage);
  },
});
