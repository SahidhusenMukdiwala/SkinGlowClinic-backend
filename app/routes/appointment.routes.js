import { Router } from 'express';
import * as appointmentController from '../controllers/appointmentController.js';
import { validate } from '../middleware/validate.js';
import { bookingLimiter } from '../middleware/rateLimiter.js';
import { authenticate } from '../middleware/auth.js';
import { appointmentSchema } from '../validators/appointment.validator.js';

const router = Router();

// Public route to inspect booked slots for a given date
router.get('/booked-slots', appointmentController.getBookedSlots);

// Authenticated route to book an appointment with rate limiting & validation
router.post('/', bookingLimiter, authenticate, validate(appointmentSchema), appointmentController.bookAppointment);

export default router;

