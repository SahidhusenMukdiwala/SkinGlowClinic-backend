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

    const user = await UserMaster.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return errorResponse(res, 'User no longer exists.', 401);
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    return errorResponse(res, 'Authentication failed.', 401);
  }
};
