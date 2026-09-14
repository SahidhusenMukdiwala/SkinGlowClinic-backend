import { errorResponse } from '../utils/responseHelper.js';

/**
 * Middleware to validate that req.params.id is a positive 32-bit integer.
 */
export const validateIdParam = (req, res, next) => {
  const rawId = req.params.id;
  const id = parseInt(rawId, 10);

  if (isNaN(id) || id <= 0 || id > 2147483647 || String(id) !== String(rawId)) {
    return errorResponse(res, 'Invalid resource ID.', 400);
  }

  req.params.id = id;
  next();
};
