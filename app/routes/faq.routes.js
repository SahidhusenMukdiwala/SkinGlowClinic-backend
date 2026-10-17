import { Router } from 'express';
import * as faqController from '../controllers/faqController.js';

const router = Router();

// Public: Get all active FAQs (ordered latest created first)
router.get('/', faqController.getPublicFaqs);

export default router;
