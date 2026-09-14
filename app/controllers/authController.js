import * as authService from '../services/authService.js';
import { uploadBufferToCloudinary } from '../utils/cloudinary.js';
import { successResponse } from '../utils/responseHelper.js';

export const login = async (req, res, next) => {
  try {
    const { identifier, email, mobile, password } = req.body;
    const loginIdentifier = identifier || email || mobile;

    const result = await authService.loginAdmin({
      identifier: loginIdentifier,
      password,
      ip: req.ip || req.socket?.remoteAddress,
    });

    return successResponse(res, result, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const { full_name, email, mobile, password } = req.body;

    const result = await authService.registerCustomer({
      full_name,
      email,
      mobile,
      password,
      ip: req.ip || req.socket?.remoteAddress,
    });

    return successResponse(res, result, 'Account registered successfully', 201);
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

export const refreshToken = async (req, res, next) => {
  try {
    const token =
      req.headers['refreshtoken'] ||
      req.headers['refresh-token'] ||
      req.body?.refresh_token ||
      req.body?.refreshToken;

    const result = await authService.refreshAccessToken(token);
    return successResponse(res, result, 'Token refreshed successfully');
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const token = req.token || req.headers.authorization;
    const refreshToken =
      req.headers['refreshtoken'] ||
      req.headers['refresh-token'] ||
      req.body?.refresh_token ||
      req.body?.refreshToken;
    const userId = req.user?.id;

    const result = await authService.logoutAdmin({ userId, token, refreshToken });
    return successResponse(res, result, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    let profileImageUrl = req.body.profile_image;

    if (req.file && req.file.buffer) {
      const uploadRes = await uploadBufferToCloudinary(req.file.buffer, 'skinglowclinic/profiles');
      profileImageUrl = uploadRes.secure_url;
    }

    const payload = {};
    if (req.body.full_name !== undefined) payload.full_name = req.body.full_name;
    if (req.body.mobile !== undefined) payload.mobile = req.body.mobile;
    if (profileImageUrl !== undefined) payload.profile_image = profileImageUrl;

    const updatedUser = await authService.updateUserProfile(req.user.id, payload);
    return successResponse(res, updatedUser, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

