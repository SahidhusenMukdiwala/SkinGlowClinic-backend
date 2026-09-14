import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';

import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { corsOptions } from './config/cors.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { successResponse, errorResponse } from './utils/responseHelper.js';

import routes from './routes/index.js';

const app = express();

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors(corsOptions));

// HTTP Request Logger & Compression
app.use(
  morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev', {
    ...(env.NODE_ENV === 'production' && {
      stream: { write: (msg) => logger.info(msg.trim()) },
    }),
  })
);
app.use(compression());

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply General Rate Limiter to all API routes
app.use('/api', generalLimiter);

// System Health Check Endpoint
app.get('/api/health', (req, res) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'SkinGlow Clinic API',
  };

  if (env.NODE_ENV !== 'production') {
    healthData.uptime = process.uptime();
  }

  return successResponse(res, healthData, 'SkinGlow Clinic API is operational');
});

// Mount All Application API Routes
app.use('/api', routes);

// 404 Handler for Unhandled Routes
app.use((req, res) => {
  return errorResponse(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
});

// Centralized Error Handler
app.use(errorHandler);

export default app;
