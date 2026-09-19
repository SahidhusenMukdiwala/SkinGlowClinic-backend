import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UserMaster, SessionMaster } from '../models/index.js';
import { errorResponse } from '../utils/responseHelper.js';
import { ROLES, ROLE_GROUPS } from '../constants/roles.js';

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

/**
 * Role-Based Access Control (RBAC) middleware factory
 * Allows checking one or multiple roles, arrays, or role groups.
 *
 * Example usage:
 *   router.get('/admin-only', authenticate, checkRole(ROLES.SUPER_ADMIN, ROLES.ADMIN));
 *   router.get('/customer-only', authenticate, checkRole(ROLES.CUSTOMER));
 *   router.get('/shared', authenticate, checkRole(ROLE_GROUPS.ALL_AUTHENTICATED));
 */
export const checkRole = (...allowedRoles) => {
  const targetRoles = allowedRoles.flat(Infinity);

  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required.', 401);
    }

    if (req.user.is_active === 0) {
      return errorResponse(res, 'Your account has been deactivated. Please contact clinic support.', 403);
    }

    if (!targetRoles.includes(req.user.role)) {
      return errorResponse(res, 'Access denied. You do not have permission to access this resource.', 403);
    }

    next();
  };
};

/**
 * Backward-compatible middleware for administrative access (Super Admin or Admin: 0 or 1)
 */
export const requireAdmin = checkRole(ROLE_GROUPS.ADMINS_ONLY);

/**
 * Helper middleware strictly for Super Admin access (0)
 */
export const requireSuperAdmin = checkRole(ROLE_GROUPS.SUPER_ADMIN_ONLY);

/**
 * Helper middleware strictly for Customer/Patient access (2)
 */
export const requireCustomer = checkRole(ROLE_GROUPS.CUSTOMERS_ONLY);

/**
 * Helper middleware for any authenticated user regardless of role (0, 1, or 2)
 */
export const requireAnyAuthenticated = checkRole(ROLE_GROUPS.ALL_AUTHENTICATED);

