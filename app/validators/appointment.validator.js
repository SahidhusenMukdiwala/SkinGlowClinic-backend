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

export const createAdminAppointmentSchema = Joi.object({
  patient_name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Patient name is required.',
    'any.required': 'Patient name is required.',
  }),
  phone: Joi.string()
    .trim()
    .pattern(/^(\+91[\s-]?)?[6-9]\d{9}$/)
    .required()
    .messages({
      'string.empty': 'Patient mobile number is required.',
      'any.required': 'Patient mobile number is required.',
      'string.pattern.base': 'Please enter an exact 10-digit mobile number starting with 6, 7, 8, or 9.',
    }),
  email: Joi.string().trim().email().optional().allow('', null).messages({
    'string.email': 'Please provide a valid email address.',
  }),
  treatment_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Please select a valid treatment procedure.',
    'any.required': 'Please select a treatment for this appointment.',
  }),
  preferred_date_time: Joi.date().iso().required().messages({
    'date.base': 'Please select a valid appointment date and time.',
    'any.required': 'Appointment date and time is required.',
  }),
  status: Joi.number().integer().valid(0, 1, 2, 3).optional().default(1), // Default Confirmed (1) for clinic-booked appointments
  message: Joi.string().trim().max(3000).allow('', null).default(''),
  admin_notes: Joi.string().trim().max(3000).allow('', null).default(''),
});
