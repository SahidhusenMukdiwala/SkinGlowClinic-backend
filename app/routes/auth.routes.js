import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { authenticate } from '../middleware/auth.js';
import { loginSchema } from '../validators/auth.validator.js';

const router = Router();

router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.get('/me', authenticate, authController.getMe);

export default router;
