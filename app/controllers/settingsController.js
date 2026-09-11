import * as settingsService from '../services/settingsService.js';
import { successResponse } from '../utils/responseHelper.js';

export const getSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.getPublicSettings();
    return successResponse(res, settings, 'Site settings retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getAdminSettings = async (req, res, next) => {
  try {
    const result = await settingsService.getAllAdminSettings();
    return successResponse(res, result, 'Admin site settings retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const result = await settingsService.updateSettings(req.body);
    return successResponse(res, result, 'Site settings updated successfully');
  } catch (error) {
    next(error);
  }
};
