import { errorResponse } from '../utils/responseHelper.js';

/**
 * Validate incoming request data against a Joi schema
 * @param {import('joi').Schema} schema
 * @param {'body' | 'query' | 'params'} source
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map(d => ({
        field: d.path.join('.'),
        message: d.message.replace(/['"]/g, ''),
      }));
      return errorResponse(res, 'Validation failed', 422, details);
    }

    req[source] = value;
    next();
  };
};
