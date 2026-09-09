import * as dashboardService from '../services/dashboardService.js';
import { successResponse } from '../utils/responseHelper.js';

export const getStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getDashboardStats();
    return successResponse(res, stats, 'Dashboard metrics retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};
