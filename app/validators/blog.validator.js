import Joi from 'joi';

export const createBlogSchema = Joi.object({
  title: Joi.string().trim().min(3).max(255).required().messages({
    'string.empty': 'Blog title is required.',
    'any.required': 'Blog title is required.',
  }),
  slug: Joi.string().trim().lowercase().pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).allow('', null).messages({
    'string.pattern.base': 'Slug must only contain lowercase letters, numbers, and hyphens.',
  }),
  content: Joi.string().trim().min(10).required().messages({
    'string.empty': 'Article content is required.',
    'any.required': 'Article content is required.',
  }),
  cover_image: Joi.string().trim().max(500).allow('', null),
  is_published: Joi.number().integer().valid(0, 1).default(1),
});

export const updateBlogSchema = Joi.object({
  title: Joi.string().trim().min(3).max(255),
  slug: Joi.string().trim().lowercase().pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).allow('', null),
  content: Joi.string().trim().min(10),
  cover_image: Joi.string().trim().max(500).allow('', null),
  is_published: Joi.number().integer().valid(0, 1),
});
