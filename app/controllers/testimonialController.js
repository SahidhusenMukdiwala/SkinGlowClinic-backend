import * as testimonialService from '../services/testimonialService.js';
import { successResponse, createdResponse } from '../utils/responseHelper.js';

export const getAllTestimonials = async (req, res, next) => {
  try {
    const testimonials = await testimonialService.getActiveTestimonials();
    return successResponse(res, testimonials, 'Testimonials retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getAdminTestimonials = async (req, res, next) => {
  try {
    const result = await testimonialService.getAdminTestimonials(req.query);
    return successResponse(res, result, 'Testimonials retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getTestimonialById = async (req, res, next) => {
  try {
    const testimonial = await testimonialService.getTestimonialById(req.params.id);
    return successResponse(res, testimonial, 'Testimonial retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createTestimonial = async (req, res, next) => {
  try {
    const testimonial = await testimonialService.createTestimonial(req.body, req.file);
    return createdResponse(res, testimonial, 'Testimonial created successfully');
  } catch (error) {
    next(error);
  }
};

export const updateTestimonial = async (req, res, next) => {
  try {
    const testimonial = await testimonialService.updateTestimonial(req.params.id, req.body, req.file);
    return successResponse(res, testimonial, 'Testimonial updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteTestimonial = async (req, res, next) => {
  try {
    const result = await testimonialService.deleteTestimonial(req.params.id);
    return successResponse(res, result, result.message);
  } catch (error) {
    next(error);
  }
};
