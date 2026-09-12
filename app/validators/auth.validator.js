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

export const registerCustomerSchema = Joi.object({
  full_name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Full name is required.',
    'string.min': 'Full name must be at least 2 characters.',
    'any.required': 'Full name is required.',
  }),
  email: Joi.string().trim().email().required().messages({
    'string.empty': 'Email address is required.',
    'string.email': 'Please provide a valid email address.',
    'any.required': 'Email address is required.',
  }),
  mobile: Joi.string().trim().pattern(/^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$|^[0-9]{10}$/).required().messages({
    'string.empty': 'Mobile number is required.',
    'string.pattern.base': 'Please enter a valid 10-digit mobile number.',
    'any.required': 'Mobile number is required.',
  }),
  password: Joi.string().min(6).max(100).required().messages({
    'string.empty': 'Password is required.',
    'string.min': 'Password must be at least 6 characters.',
    'any.required': 'Password is required.',
  }),
});

