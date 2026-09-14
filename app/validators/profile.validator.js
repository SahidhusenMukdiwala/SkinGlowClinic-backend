import Joi from 'joi';

export const updateProfileSchema = Joi.object({
  full_name: Joi.string().trim().min(2).max(100).optional().messages({
    'string.base': 'Full name must be a string.',
    'string.min': 'Full name must be at least 2 characters.',
    'string.max': 'Full name cannot exceed 100 characters.',
  }),
  mobile: Joi.string().trim().min(10).max(15).optional().messages({
    'string.base': 'Mobile number must be a string.',
    'string.min': 'Mobile number must be at least 10 characters.',
    'string.max': 'Mobile number cannot exceed 15 characters.',
  }),
  profile_image: Joi.string().uri().allow('', null).optional().messages({
    'string.uri': 'Profile image must be a valid URL.',
  }),
});
