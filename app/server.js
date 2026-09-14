import app from './app.js';
import { env } from './config/env.js';
import { Op } from 'sequelize';
import { SessionMaster } from './models/index.js';
import { testConnection } from './config/database.js';
import { logger } from './utils/logger.js';

const cleanExpiredSessions = async () => {
  try {
    const expiryThreshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days
    const deletedCount = await SessionMaster.destroy({
      where: {
        createdAt: { [Op.lt]: expiryThreshold },
      },
    });
    if (deletedCount > 0) {
      logger.info(`🧹 Cleaned up ${deletedCount} expired session(s) from session_master.`);
    }
  } catch (err) {
    logger.error('Failed to clean up expired sessions:', err);
  }
};

const startServer = async () => {
  try {
    // logger.info(`Starting SkinGlow Clinic API Server in ${env.NODE_ENV} mode...`);

    // Test Database Connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      if (env.NODE_ENV === 'production') {
        logger.error('❌ Database connection failed. Exiting process in production mode.');
        process.exit(1);
      }
      logger.warn('⚠️ Server will start, but database operations may fail until MySQL connection is established.');
    } else {
      // Run initial session cleanup and schedule daily background job
      cleanExpiredSessions();
      const cleanupInterval = setInterval(cleanExpiredSessions, 24 * 60 * 60 * 1000);
      cleanupInterval.unref();
    }

    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 SkinGlow Clinic Backend running at http://localhost:${env.PORT}`);
      // logger.info(`🔍 Health check available at: http://localhost:${env.PORT}/api/health`);
    });

    // Graceful Shutdown
    const shutdown = (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);

      // Force shutdown after 10 seconds if connections don't drain
      const forceTimeout = setTimeout(() => {
        logger.error('Forced shutdown — connections did not close in time.');
        process.exit(1);
      }, 10000);
      forceTimeout.unref();

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

// Handle uncaught exceptions and unhandled promise rejections
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception thrown:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection at:', promise, 'reason:', reason);
  if (env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

startServer();

