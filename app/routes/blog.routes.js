import { Router } from 'express';
import * as blogController from '../controllers/blogController.js';

const router = Router();

// Public blog endpoints
router.get('/', blogController.getPublishedBlogs);
router.get('/:slug', blogController.getBlogBySlug);

export default router;
