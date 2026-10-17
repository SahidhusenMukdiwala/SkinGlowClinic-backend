import rateLimit from 'express-rate-limit';

// Standard general API limiter: 600 requests per 15 minutes (ensures smooth browsing across tabs)
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin dashboard limiter: 1200 requests per 15 minutes
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1200,
  message: {
    success: false,
    message: 'Too many admin requests. Please wait a moment.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Appointment booking limiter: 10 attempts per 15 minutes keyed on user ID or IP
export const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => {
    return req.user?.id ? `user_${req.user.id}` : (req.ip || 'ip');
  },
  validate: { keyGeneratorIpFallback: false },
  message: {
    success: false,
    message: 'Too many appointment booking attempts. Please wait a few minutes before trying again.',
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

// Admin auth limiter: 10 attempts per 15 minutes (for login and registration)
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

// Refresh token limiter: 60 requests per 15 minutes (ensures active multi-tab sessions are not prematurely throttled)
export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: {
    success: false,
    message: 'Too many session refresh requests. Please wait a moment.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
