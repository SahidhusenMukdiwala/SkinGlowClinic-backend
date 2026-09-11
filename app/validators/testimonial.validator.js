import Joi from 'joi';

export const createTestimonialSchema = Joi.object({
  patient_name: Joi.string().trim().min(2).max(255).required().messages({
    'string.empty': 'Patient name is required.',
    'any.required': 'Patient name is required.',
  }),
  patient_image: Joi.string().trim().max(500).allow('', null),
  review_text: Joi.string().trim().min(5).required().messages({
    'string.empty': 'Review text is required.',
    'any.required': 'Review text is required.',
  }),
  rating: Joi.number().integer().min(1).max(5).required().messages({
    'number.base': 'Rating must be an integer between 1 and 5.',
    'any.required': 'Star rating is required.',
  }),
  is_active: Joi.number().integer().valid(0, 1).default(1),
});

export const updateTestimonialSchema = Joi.object({
  patient_name: Joi.string().trim().min(2).max(255),
  patient_image: Joi.string().trim().max(500).allow('', null),
  review_text: Joi.string().trim().min(5),
  rating: Joi.number().integer().min(1).max(5),
  is_active: Joi.number().integer().valid(0, 1),
});
