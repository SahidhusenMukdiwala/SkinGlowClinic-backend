import Joi from 'joi';

export const inquirySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Please enter your full name.',
    'string.min': 'Name must be at least 2 characters.',
    'string.max': 'Name cannot exceed 100 characters.',
    'any.required': 'Full name is required.',
  }),
  email: Joi.string().trim().email().required().messages({
    'string.empty': 'Please enter your email address.',
    'string.email': 'Please enter a valid email address.',
    'any.required': 'Email address is required.',
  }),
  phone: Joi.string().trim().pattern(/^(\+91\s)?[0-9]{10}$/).required().messages({
    'string.empty': 'Please enter your phone number.',
    'string.pattern.base': 'Please enter a valid 10-digit phone number (e.g. +91 9578412035).',
    'any.required': 'Phone number is required.',
  }),
  subject: Joi.string().trim().min(2).max(200).required().messages({
    'string.empty': 'Please specify the inquiry subject.',
    'string.min': 'Subject must be at least 2 characters long.',
    'string.max': 'Subject cannot exceed 200 characters.',
    'any.required': 'Subject is required.',
  }),
  message: Joi.string().trim().min(10).max(3000).required().messages({
    'string.empty': 'Please provide details in your message.',
    'string.min': 'Message must be at least 10 characters long.',
    'string.max': 'Message cannot exceed 3000 characters.',
    'any.required': 'Message is required.',
  }),
});
