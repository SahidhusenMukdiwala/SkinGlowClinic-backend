import Joi from 'joi';

export const appointmentSchema = Joi.object({
  patient_name: Joi.string().trim().min(2).max(100).optional().allow('', null),
  email: Joi.string().trim().email().optional().allow('', null),
  phone: Joi.string().trim().optional().allow('', null),
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
