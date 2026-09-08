import * as authService from '../services/authService.js';
import { successResponse } from '../utils/responseHelper.js';

export const login = async (req, res, next) => {
  try {
    const { identifier, email, mobile, password } = req.body;
    const loginIdentifier = identifier || email || mobile;

    const result = await authService.loginAdmin({
      identifier: loginIdentifier,
      password,
      ip: req.ip || req.connection?.remoteAddress,
    });

    return successResponse(res, result, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const profile = await authService.getAdminProfile(req.user.id);
    return successResponse(res, profile, 'Admin profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};
