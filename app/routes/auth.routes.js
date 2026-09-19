import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { authenticate, requireAnyAuthenticated } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { loginSchema, registerCustomerSchema } from '../validators/auth.validator.js';
import { updateProfileSchema } from '../validators/profile.validator.js';

const router = Router();

router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/register', authLimiter, validate(registerCustomerSchema), authController.register);
router.get('/me', authenticate, requireAnyAuthenticated, authController.getMe);
router.put('/profile', authenticate, requireAnyAuthenticated, upload.single('profile_image'), validate(updateProfileSchema), authController.updateProfile);
router.patch('/profile', authenticate, requireAnyAuthenticated, upload.single('profile_image'), validate(updateProfileSchema), authController.updateProfile);
router.get('/refresh-token', authLimiter, authController.refreshToken);
router.post('/refresh-token', authLimiter, authController.refreshToken);
router.post('/logout', authenticate, requireAnyAuthenticated, authController.logout);

export default router;
