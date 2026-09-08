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
