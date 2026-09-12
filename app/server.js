import app from './app.js';
import { env } from './config/env.js';
import { testConnection } from './config/database.js';
import { logger } from './utils/logger.js';

const startServer = async () => {
  try {
    // logger.info(`Starting SkinGlow Clinic API Server in ${env.NODE_ENV} mode...`);

    // Test Database Connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      logger.warn('⚠️ Server will start, but database operations may fail until MySQL connection is established.');
    }

    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 SkinGlow Clinic Backend running at http://localhost:${env.PORT}`);
      // logger.info(`🔍 Health check available at: http://localhost:${env.PORT}/api/health`);
    });

    // Graceful Shutdown
    const shutdown = (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
