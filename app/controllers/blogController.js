import * as blogService from '../services/blogService.js';
import { successResponse, createdResponse, errorResponse } from '../utils/responseHelper.js';

export const getPublishedBlogs = async (req, res, next) => {
  try {
    const result = await blogService.getPublishedBlogs(req.query);
    return successResponse(res, result, 'Published blogs retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getBlogBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const result = await blogService.getBlogBySlug(slug);
    if (!result) {
      return errorResponse(res, `Blog article not found with slug: ${slug}`, 404);
    }
    return successResponse(res, result, 'Blog article retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getAdminBlogs = async (req, res, next) => {
  try {
    const result = await blogService.getAdminBlogs(req.query);
    return successResponse(res, result, 'Blogs retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getBlogById = async (req, res, next) => {
  try {
    const blog = await blogService.getBlogById(req.params.id);
    return successResponse(res, blog, 'Blog article retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createBlog = async (req, res, next) => {
  try {
    const blog = await blogService.createBlog(req.body, req.file);
    return createdResponse(res, blog, 'Blog post created successfully');
  } catch (error) {
    next(error);
  }
};

export const updateBlog = async (req, res, next) => {
  try {
    const blog = await blogService.updateBlog(req.params.id, req.body, req.file);
    return successResponse(res, blog, 'Blog post updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    const result = await blogService.deleteBlog(req.params.id);
    return successResponse(res, result, result.message);
  } catch (error) {
    next(error);
  }
};
