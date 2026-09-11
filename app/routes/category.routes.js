import { Router } from 'express';
import * as categoryController from '../controllers/categoryController.js';

const router = Router();

// Public: Fetch active categories for dropdowns & filters
router.get('/', categoryController.getActiveCategories);

export default router;
