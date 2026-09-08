import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';

import { corsOptions } from './config/cors.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { successResponse, errorResponse } from './utils/responseHelper.js';

const app = express();

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors(corsOptions));

// HTTP Request Logger & Compression
app.use(morgan('dev'));
app.use(compression());

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply General Rate Limiter to all API routes
app.use('/api', generalLimiter);

// System Health Check Endpoint
app.get('/api/health', (req, res) => {
  return successResponse(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'SkinGlow Clinic API',
  }, 'SkinGlow Clinic API is operational');
});

// 404 Handler for Unhandled Routes
app.use((req, res) => {
  return errorResponse(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
});

// Centralized Error Handler
app.use(errorHandler);

export default app;
