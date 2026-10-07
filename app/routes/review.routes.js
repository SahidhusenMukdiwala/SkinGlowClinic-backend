import { Router } from 'express';
import { authenticate, requireCustomer } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { submitReviewSchema } from '../validators/review.validator.js';
import * as reviewController from '../controllers/reviewController.js';

const router = Router();

router.post(
  '/',
  authenticate,
  requireCustomer,
  validate(submitReviewSchema),
  reviewController.submitReview
);

router.get(
  '/status/:appointmentId',
  authenticate,
  requireCustomer,
  reviewController.checkReviewStatus
);

export default router;
