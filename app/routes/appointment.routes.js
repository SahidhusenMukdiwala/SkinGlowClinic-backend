import { Router } from 'express';
import * as appointmentController from '../controllers/appointmentController.js';
import { validate } from '../middleware/validate.js';
import { bookingLimiter } from '../middleware/rateLimiter.js';
import { authenticate, requireAnyAuthenticated } from '../middleware/auth.js';
import { appointmentSchema } from '../validators/appointment.validator.js';

const router = Router();

// Public route to inspect booked slots for a given date
router.get('/booked-slots', appointmentController.getBookedSlots);

// Authenticated route for customers and admins to book an appointment
router.post(
  '/',
  bookingLimiter,
  authenticate,
  requireAnyAuthenticated,
  validate(appointmentSchema),
  appointmentController.bookAppointment
);

export default router;

