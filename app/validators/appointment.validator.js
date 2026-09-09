import Joi from 'joi';

export const appointmentSchema = Joi.object({
  patient_name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Please enter your full name.',
    'string.min': 'Name must be at least 2 characters long.',
    'string.max': 'Name cannot exceed 100 characters.',
    'any.required': 'Patient full name is required.',
  }),
  email: Joi.string().trim().email().required().messages({
    'string.empty': 'Please enter your email address.',
    'string.email': 'Please enter a valid email address.',
    'any.required': 'Email address is required.',
  }),
  phone: Joi.string().trim().pattern(/^(\+?[0-9]{1,4}[\s-]?)?[0-9]{10}$/).required().messages({
    'string.empty': 'Please enter your phone number.',
    'string.pattern.base': 'Please enter a valid 10-digit mobile number (e.g., 9820123456 or +91 9820123456).',
    'any.required': 'Mobile phone number is required.',
  }),
  treatment_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Please select a valid treatment procedure.',
    'number.positive': 'Please select a valid treatment procedure.',
    'any.required': 'Please select a treatment for your appointment.',
  }),
  preferred_date_time: Joi.date().iso().required().messages({
    'date.base': 'Please select a valid appointment date and time.',
    'date.format': 'Date and time must be in a valid ISO format.',
    'any.required': 'Preferred appointment date and time is required.',
  }),
  message: Joi.string().trim().max(3000).allow('', null).default('').messages({
    'string.max': 'Message cannot exceed 3000 characters.',
  }),
});
