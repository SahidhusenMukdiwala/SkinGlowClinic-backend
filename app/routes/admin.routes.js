import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';

import * as dashboardController from '../controllers/dashboardController.js';
import * as appointmentController from '../controllers/appointmentController.js';
import * as inquiryController from '../controllers/inquiryController.js';
import * as categoryController from '../controllers/categoryController.js';
import * as treatmentController from '../controllers/treatmentController.js';
import * as testimonialController from '../controllers/testimonialController.js';
import * as blogController from '../controllers/blogController.js';
import * as settingsController from '../controllers/settingsController.js';
import * as uploadController from '../controllers/uploadController.js';

import { createCategorySchema, updateCategorySchema } from '../validators/category.validator.js';
import { createTreatmentSchema, updateTreatmentSchema } from '../validators/treatment.validator.js';
import { createTestimonialSchema, updateTestimonialSchema } from '../validators/testimonial.validator.js';
import { createBlogSchema, updateBlogSchema } from '../validators/blog.validator.js';
import { updateSettingsSchema } from '../validators/settings.validator.js';

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

// --- Categories CRUD ---
router.get('/categories', categoryController.getAdminCategories);
router.get('/categories/:id', categoryController.getCategoryById);
router.post('/categories', validate(createCategorySchema), categoryController.createCategory);
router.put('/categories/:id', validate(updateCategorySchema), categoryController.updateCategory);
router.delete('/categories/:id', categoryController.deleteCategory);

// --- Treatments CRUD ---
router.get('/treatments', treatmentController.getAdminTreatments);
router.get('/treatments/:id', treatmentController.getTreatmentById);
router.post('/treatments', upload.single('image'), validate(createTreatmentSchema), treatmentController.createTreatment);
router.put('/treatments/:id', upload.single('image'), validate(updateTreatmentSchema), treatmentController.updateTreatment);
router.delete('/treatments/:id', treatmentController.deleteTreatment);

// --- Testimonials CRUD ---
router.get('/testimonials', testimonialController.getAdminTestimonials);
router.get('/testimonials/:id', testimonialController.getTestimonialById);
router.post('/testimonials', upload.single('patient_image'), validate(createTestimonialSchema), testimonialController.createTestimonial);
router.put('/testimonials/:id', upload.single('patient_image'), validate(updateTestimonialSchema), testimonialController.updateTestimonial);
router.delete('/testimonials/:id', testimonialController.deleteTestimonial);

// --- Blog Articles CRUD ---
router.get('/blogs', blogController.getAdminBlogs);
router.get('/blogs/:id', blogController.getBlogById);
router.post('/blogs', upload.single('cover_image'), validate(createBlogSchema), blogController.createBlog);
router.put('/blogs/:id', upload.single('cover_image'), validate(updateBlogSchema), blogController.updateBlog);
router.delete('/blogs/:id', blogController.deleteBlog);

// --- Site Settings Management ---
router.get('/settings', settingsController.getAdminSettings);
router.put('/settings', validate(updateSettingsSchema), settingsController.updateSettings);

// --- Direct Media Upload ---
router.post('/upload', upload.single('image'), uploadController.uploadMedia);

export default router;
