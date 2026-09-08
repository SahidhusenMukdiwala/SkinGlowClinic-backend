import * as treatmentService from '../services/treatmentService.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

export const getAllTreatments = async (req, res, next) => {
  try {
    const { category } = req.query;
    const treatments = await treatmentService.getActiveTreatments(category);
    return successResponse(res, treatments, 'Treatments retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getTreatmentDetail = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const result = await treatmentService.getTreatmentBySlug(slug);

    if (!result) {
      return errorResponse(res, `Treatment not found with slug: ${slug}`, 404);
    }

    return successResponse(res, result, 'Treatment details retrieved successfully');
  } catch (error) {
    next(error);
  }
};
