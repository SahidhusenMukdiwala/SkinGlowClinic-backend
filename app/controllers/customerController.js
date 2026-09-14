import * as customerService from '../services/customerService.js';
import { successResponse } from '../utils/responseHelper.js';

export const getAdminCustomers = async (req, res, next) => {
  try {
    const result = await customerService.getAdminCustomers(req.query);
    return successResponse(res, result, 'Customers retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req, res, next) => {
  try {
    const result = await customerService.getCustomerById(req.params.id);
    return successResponse(res, result, 'Customer details retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateCustomerStatus = async (req, res, next) => {
  try {
    const { is_active } = req.body;
    const result = await customerService.updateCustomerStatus(req.params.id, is_active);
    const message = result.is_active === 1
      ? 'Customer account has been successfully activated'
      : 'Customer account has been deactivated and active sessions revoked';
    return successResponse(res, result, message);
  } catch (error) {
    next(error);
  }
};
