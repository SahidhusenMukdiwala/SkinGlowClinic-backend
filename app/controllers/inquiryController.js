import * as inquiryService from '../services/inquiryService.js';
import { successResponse } from '../utils/responseHelper.js';

export const submitInquiry = async (req, res, next) => {
  try {
    const inquiry = await inquiryService.createInquiry(req.body);
    return successResponse(
      res,
      {
        id: inquiry.id,
        name: inquiry.name,
        email: inquiry.email,
        createdAt: inquiry.createdAt,
      },
      'Thank you for reaching out! Our clinical team will contact you shortly.',
      201
    );
  } catch (error) {
    next(error);
  }
};

export const getAdminInquiries = async (req, res, next) => {
  try {
    const result = await inquiryService.getAdminInquiries(req.query);
    return successResponse(res, result, 'Inquiries retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

export const getInquiryById = async (req, res, next) => {
  try {
    const inquiry = await inquiryService.getInquiryById(req.params.id);
    return successResponse(res, inquiry, 'Inquiry details retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

export const markInquiryRead = async (req, res, next) => {
  try {
    const is_read = req.body.is_read !== undefined ? req.body.is_read : 1;
    const inquiry = await inquiryService.updateInquiryReadStatus(req.params.id, is_read);
    return successResponse(res, inquiry, 'Inquiry status updated successfully', 200);
  } catch (error) {
    next(error);
  }
};

export const deleteInquiry = async (req, res, next) => {
  try {
    const result = await inquiryService.deleteInquiry(req.params.id);
    return successResponse(res, result, 'Inquiry deleted successfully', 200);
  } catch (error) {
    next(error);
  }
};

