import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Generate a signed review JWT token for an appointment (valid for 24 hours)
 */
export const generateReviewToken = ({ appointmentId, userId }) => {
  return jwt.sign(
    {
      appointmentId: Number(appointmentId),
      userId: Number(userId),
      purpose: 'review',
    },
    env.JWT.REVIEW_SECRET,
    { expiresIn: '24h' }
  );
};

/**
 * Verify and decode a review JWT token
 */
export const verifyReviewToken = (token) => {
  try {
    const decoded = jwt.verify(token, env.JWT.REVIEW_SECRET);
    if (decoded.purpose !== 'review') {
      const error = new Error('Invalid token purpose.');
      error.statusCode = 400;
      error.code = 'TOKEN_INVALID';
      throw error;
    }
    return decoded;
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      const error = new Error('This review link has expired. Review links are valid for 24 hours after treatment completion.');
      error.statusCode = 400;
      error.code = 'TOKEN_EXPIRED';
      throw error;
    }
    const error = new Error(err.message || 'Invalid or corrupted review token.');
    error.statusCode = 400;
    error.code = 'TOKEN_INVALID';
    throw error;
  }
};
