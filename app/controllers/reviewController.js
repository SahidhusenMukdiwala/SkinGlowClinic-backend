import * as testimonialService from '../services/testimonialService.js';
import { verifyReviewToken } from '../utils/reviewToken.js';
import { Appointment } from '../models/index.js';
import { successResponse } from '../utils/responseHelper.js';

export const submitReview = async (req, res, next) => {
  try {
    const { review_token, review_text, rating } = req.body;

    // Verify and decode JWT review token
    const tokenData = verifyReviewToken(review_token);

    // Verify token belongs to the currently authenticated user
    if (Number(req.user.id) !== Number(tokenData.userId)) {
      const error = new Error('You cannot submit a review using another patient’s link.');
      error.statusCode = 403;
      throw error;
    }

    const review = await testimonialService.submitCustomerReview({
      userId: req.user.id,
      appointmentId: tokenData.appointmentId,
      reviewText: review_text,
      rating,
    });

    return successResponse(
      res,
      review,
      'Thank you for your feedback! Your review has been submitted and will appear on our website once reviewed by our clinical team.',
      201
    );
  } catch (error) {
    next(error);
  }
};

export const checkReviewStatus = async (req, res, next) => {
  try {
    const appointmentId = parseInt(req.params.appointmentId, 10);
    if (isNaN(appointmentId)) {
      const error = new Error('Invalid appointment ID');
      error.statusCode = 400;
      throw error;
    }

    const appointment = await Appointment.findOne({
      where: { id: appointmentId, is_delete: 0 },
    });

    if (!appointment) {
      const error = new Error('Appointment not found');
      error.statusCode = 404;
      throw error;
    }

    // Verify ownership
    if (Number(appointment.user_id) !== Number(req.user.id)) {
      const error = new Error('You are not authorized to view the review status for this appointment.');
      error.statusCode = 403;
      throw error;
    }

    const review = await testimonialService.getReviewByAppointmentId(appointmentId);

    return successResponse(
      res,
      {
        hasReviewed: !!review,
        review,
        appointmentStatus: appointment.status,
      },
      'Review status retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};
