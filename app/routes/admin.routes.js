import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as dashboardController from '../controllers/dashboardController.js';
import * as appointmentController from '../controllers/appointmentController.js';
import * as inquiryController from '../controllers/inquiryController.js';

const router = Router();

// Enforce JWT authentication on all admin endpoints
router.use(authenticate);

// --- Dashboard ---
router.get('/dashboard/stats', dashboardController.getStats);

// --- Appointments Management ---
router.get('/appointments', appointmentController.getAdminAppointments);
router.get('/appointments/:id', appointmentController.getAppointmentById);
router.patch('/appointments/:id', appointmentController.updateAppointment);
router.delete('/appointments/:id', appointmentController.deleteAppointment);

// --- Inquiries Management ---
router.get('/inquiries', inquiryController.getAdminInquiries);
router.get('/inquiries/:id', inquiryController.getInquiryById);
router.patch('/inquiries/:id/read', inquiryController.markInquiryRead);
router.delete('/inquiries/:id', inquiryController.deleteInquiry);

export default router;
