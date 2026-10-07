import Joi from 'joi';

export const submitReviewSchema = Joi.object({
  review_token: Joi.string().required().messages({
    'string.empty': 'Review token is required.',
    'any.required': 'Review token is required.',
  }),
  review_text: Joi.string().trim().min(10).max(500).required().messages({
    'string.empty': 'Please share your experience.',
    'string.min': 'Review must be at least 10 characters long.',
    'string.max': 'Review cannot exceed 500 characters.',
    'any.required': 'Review text is required.',
  }),
  rating: Joi.number().integer().min(1).max(5).required().messages({
    'number.base': 'Please select a star rating.',
    'number.min': 'Rating must be at least 1 star.',
    'number.max': 'Rating cannot exceed 5 stars.',
    'any.required': 'Star rating is required.',
  }),
});
