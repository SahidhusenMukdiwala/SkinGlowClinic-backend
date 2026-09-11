import Joi from 'joi';

export const createCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(45).required().messages({
    'string.base': 'Category name must be a string.',
    'string.empty': 'Category name is required.',
    'string.min': 'Category name must be at least 2 characters.',
    'string.max': 'Category name cannot exceed 45 characters.',
    'any.required': 'Category name is required.',
  }),
  status: Joi.number().valid(0, 1).default(1).messages({
    'any.only': 'Status must be 1 (active) or 0 (inactive).',
  }),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(45).optional().messages({
    'string.base': 'Category name must be a string.',
    'string.min': 'Category name must be at least 2 characters.',
    'string.max': 'Category name cannot exceed 45 characters.',
  }),
  status: Joi.number().valid(0, 1).optional().messages({
    'any.only': 'Status must be 1 (active) or 0 (inactive).',
  }),
}).min(1);
