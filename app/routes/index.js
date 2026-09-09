import { Router } from 'express';
import treatmentRoutes from './treatment.routes.js';
import settingsRoutes from './settings.routes.js';
import testimonialRoutes from './testimonial.routes.js';
import inquiryRoutes from './inquiry.routes.js';
import authRoutes from './auth.routes.js';

import appointmentRoutes from './appointment.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

// Public Routes
router.use('/treatments', treatmentRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/settings', settingsRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/inquiries', inquiryRoutes);

// Auth & Admin Routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);

export default router;

