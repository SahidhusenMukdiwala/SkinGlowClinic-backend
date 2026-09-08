import { Router } from 'express';
import * as inquiryController from '../controllers/inquiryController.js';
import { validate } from '../middleware/validate.js';
import { inquiryLimiter } from '../middleware/rateLimiter.js';
import { inquirySchema } from '../validators/inquiry.validator.js';

const router = Router();

router.post('/', inquiryLimiter, validate(inquirySchema), inquiryController.submitInquiry);

export default router;
