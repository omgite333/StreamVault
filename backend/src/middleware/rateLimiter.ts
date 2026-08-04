import rateLimit from 'express-rate-limit';

const standardMessage = { success: false, message: 'Too many requests. Please try again later.' };

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { ...standardMessage, message: 'Too many login attempts. Please try again later.' },
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 500,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: standardMessage,
});
