import * as testimonialService from '../services/testimonialService.js';
import { successResponse } from '../utils/responseHelper.js';

export const getAllTestimonials = async (req, res, next) => {
  try {
    const testimonials = await testimonialService.getActiveTestimonials();
    return successResponse(res, testimonials, 'Testimonials retrieved successfully');
  } catch (error) {
    next(error);
  }
};
