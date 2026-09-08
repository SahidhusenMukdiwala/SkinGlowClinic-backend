import { Router } from 'express';
import * as settingsController from '../controllers/settingsController.js';

const router = Router();

router.get('/', settingsController.getSettings);

export default router;
