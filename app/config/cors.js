import { env } from './env.js';

const allowedOrigins = [
  env.CLIENT_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
].filter(Boolean);

export const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like curl, Postman) only in non-production environments
    if (!origin) {
      if (env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error('Origin header required in production'));
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'platform',
    'Platform',
    'Role',
    'role',
    'refreshtoken',
    'refresh-token',
    'RefreshToken',
    'x-forwarded-for',
    'Accept',
    'Origin',
  ],
};

