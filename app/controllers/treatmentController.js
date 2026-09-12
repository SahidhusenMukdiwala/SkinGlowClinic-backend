import * as treatmentService from '../services/treatmentService.js';
import { successResponse, errorResponse, createdResponse } from '../utils/responseHelper.js';

export const getAllTreatments = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const treatments = await treatmentService.getActiveTreatments(category, search);
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

export const getAdminTreatments = async (req, res, next) => {
  try {
    const result = await treatmentService.getAdminTreatments(req.query);
    return successResponse(res, result, 'Treatments retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getTreatmentById = async (req, res, next) => {
  try {
    const treatment = await treatmentService.getTreatmentById(req.params.id);
    return successResponse(res, treatment, 'Treatment retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createTreatment = async (req, res, next) => {
  try {
    const treatment = await treatmentService.createTreatment(req.body, req.file);
    return createdResponse(res, treatment, 'Treatment created successfully');
  } catch (error) {
    next(error);
  }
};

export const updateTreatment = async (req, res, next) => {
  try {
    const treatment = await treatmentService.updateTreatment(req.params.id, req.body, req.file);
    return successResponse(res, treatment, 'Treatment updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteTreatment = async (req, res, next) => {
  try {
    const result = await treatmentService.deleteTreatment(req.params.id);
    return successResponse(res, result, result.message);
  } catch (error) {
    next(error);
  }
};
