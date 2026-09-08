import Joi from 'joi';

export const loginSchema = Joi.object({
  identifier: Joi.string().trim().required().messages({
    'string.empty': 'Please provide your email address or mobile number.',
    'any.required': 'Email address or mobile number is required.',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Please enter your password.',
    'any.required': 'Password is required.',
  }),
});
