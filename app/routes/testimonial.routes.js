import { Router } from 'express';
import * as testimonialController from '../controllers/testimonialController.js';

const router = Router();

router.get('/', testimonialController.getAllTestimonials);

export default router;
