import Joi from 'joi';

export const createFaqSchema = Joi.object({
  question: Joi.string().trim().min(5).max(500).required().messages({
    'string.base': 'Question must be a string.',
    'string.empty': 'Question is required.',
    'string.min': 'Question must be at least 5 characters.',
    'string.max': 'Question cannot exceed 500 characters.',
    'any.required': 'Question is required.',
  }),
  answer: Joi.string().trim().min(10).max(5000).required().messages({
    'string.base': 'Answer must be a string.',
    'string.empty': 'Answer is required.',
    'string.min': 'Answer must be at least 10 characters.',
    'string.max': 'Answer cannot exceed 5000 characters.',
    'any.required': 'Answer is required.',
  }),
  is_active: Joi.number().valid(0, 1).default(1).messages({
    'any.only': 'Status must be 1 (active) or 0 (inactive).',
  }),
});

export const updateFaqSchema = Joi.object({
  question: Joi.string().trim().min(5).max(500).optional().messages({
    'string.base': 'Question must be a string.',
    'string.min': 'Question must be at least 5 characters.',
    'string.max': 'Question cannot exceed 500 characters.',
  }),
  answer: Joi.string().trim().min(10).max(5000).optional().messages({
    'string.base': 'Answer must be a string.',
    'string.min': 'Answer must be at least 10 characters.',
    'string.max': 'Answer cannot exceed 5000 characters.',
  }),
  is_active: Joi.number().valid(0, 1).optional().messages({
    'any.only': 'Status must be 1 (active) or 0 (inactive).',
  }),
}).min(1);
