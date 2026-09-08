import rateLimit from 'express-rate-limit';

// Standard general API limiter: 100 requests per 15 minutes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Appointment booking limiter: 5 requests per minute
export const bookingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many booking attempts. Please wait a minute and try again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Inquiry submission limiter: 3 requests per minute
export const inquiryLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: 'Too many inquiries submitted. Please wait a minute and try again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin auth limiter: 10 attempts per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
