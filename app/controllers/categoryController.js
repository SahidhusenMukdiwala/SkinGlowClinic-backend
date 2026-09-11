import * as categoryService from '../services/categoryService.js';
import { successResponse, createdResponse } from '../utils/responseHelper.js';

export const getActiveCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getActiveCategories();
    return successResponse(res, categories, 'Active categories retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getAdminCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getAdminCategories(req.query);
    return successResponse(res, categories, 'Categories retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    return successResponse(res, category, 'Category retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);
    return createdResponse(res, category, 'Category created successfully');
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    return successResponse(res, category, 'Category updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const result = await categoryService.deleteCategory(req.params.id);
    return successResponse(res, result, result.message);
  } catch (error) {
    next(error);
  }
};
