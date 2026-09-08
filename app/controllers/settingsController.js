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
