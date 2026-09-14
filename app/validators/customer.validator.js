import Joi from 'joi';

export const updateCustomerStatusSchema = Joi.object({
  is_active: Joi.number().valid(0, 1).required().messages({
    'number.base': 'is_active must be a number (0 or 1).',
    'any.only': 'is_active must be 1 (active) or 0 (inactive).',
    'any.required': 'is_active status is required.',
  }),
});
