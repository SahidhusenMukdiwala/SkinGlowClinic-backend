import Joi from 'joi';

export const createTreatmentSchema = Joi.object({
  title: Joi.string().trim().min(2).max(255).required().messages({
    'string.empty': 'Treatment title is required.',
    'any.required': 'Treatment title is required.',
  }),
  slug: Joi.string().trim().lowercase().pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).allow('', null).messages({
    'string.pattern.base': 'Slug must only contain lowercase letters, numbers, and hyphens.',
  }),
  category_id: Joi.number().integer().positive().messages({
    'number.base': 'Category ID must be a positive integer.',
    'any.required': 'Category ID is required.',
  }),
  category: Joi.number().integer().positive().messages({
    'number.base': 'Category ID must be a positive integer.',
  }),
  short_description: Joi.string().trim().max(1000).allow('', null),
  full_description: Joi.string().trim().allow('', null),
  image_url: Joi.string().trim().max(500).allow('', null),
  duration: Joi.string().trim().max(50).allow('', null),
  is_active: Joi.number().integer().valid(0, 1).default(1),
  display_order: Joi.number().integer().default(0),
}).or('category_id', 'category');

export const updateTreatmentSchema = Joi.object({
  title: Joi.string().trim().min(2).max(255),
  slug: Joi.string().trim().lowercase().pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).allow('', null),
  category_id: Joi.number().integer().positive(),
  category: Joi.number().integer().positive(),
  short_description: Joi.string().trim().max(1000).allow('', null),
  full_description: Joi.string().trim().allow('', null),
  image_url: Joi.string().trim().max(500).allow('', null),
  duration: Joi.string().trim().max(50).allow('', null),
  is_active: Joi.number().integer().valid(0, 1),
  display_order: Joi.number().integer(),
});
