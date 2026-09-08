import { logger } from '../utils/logger.js';
import { errorResponse } from '../utils/responseHelper.js';
import { env } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled Error: %s', err.stack || err.message);

  // Sequelize Unique Constraint Error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors?.[0]?.path || 'Field';
    return errorResponse(res, `${field} already exists.`, 409);
  }

  // Sequelize Validation Error
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors?.map(e => e.message) || ['Validation error'];
    return errorResponse(res, messages.join(', '), 422, err.errors);
  }

  // Sequelize Database Error
  if (err.name === 'SequelizeDatabaseError') {
    return errorResponse(res, 'Database error occurred.', 500);
  }

  // Multer Error
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return errorResponse(res, 'File size exceeds maximum allowed limit (3 MB).', 400);
    }
    return errorResponse(res, `Upload error: ${err.message}`, 400);
  }

  // Custom HTTP Error (if status or statusCode is set)
  const statusCode = err.statusCode || err.status || 500;
  const message = env.NODE_ENV === 'production' && statusCode === 500
    ? 'Internal server error. Please try again later.'
    : err.message || 'Internal server error';

  return errorResponse(res, message, statusCode);
};
