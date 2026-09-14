import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UserMaster, SessionMaster } from '../models/index.js';
import { errorResponse } from '../utils/responseHelper.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication token required.', 401);
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT.SECRET);
    } catch (err) {
      return errorResponse(res, 'Invalid or expired token.', 401);
    }

    const [user, session] = await Promise.all([
      UserMaster.findByPk(decoded.id, {
        attributes: { exclude: ['password'] },
      }),
      SessionMaster.findOne({
        where: {
          access_token: token,
          user_id: decoded.id,
        },
      }),
    ]);

    if (!user) {
      return errorResponse(res, 'User no longer exists.', 401);
    }

    if (user.is_active === 0) {
      if (session) {
        await session.destroy().catch(() => {});
      }
      return errorResponse(res, 'Your account has been deactivated. Please contact clinic support.', 403);
    }

    if (!session) {
      return errorResponse(res, 'Session has been revoked or logged out. Please log in again.', 401);
    }

    req.user = user;
    req.session = session;
    req.token = token;
    next();
  } catch (error) {
    return errorResponse(res, 'Authentication failed.', 401);
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 'Authentication required.', 401);
  }

  // Allow Super Admin (0) and Admin (1)
  if (req.user.role !== 0 && req.user.role !== 1) {
    return errorResponse(res, 'Access denied. Administrative privileges required.', 403);
  }

  next();
};

