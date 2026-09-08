import { Router } from 'express';
import * as treatmentController from '../controllers/treatmentController.js';

const router = Router();

router.get('/', treatmentController.getAllTreatments);
router.get('/:slug', treatmentController.getTreatmentDetail);

export default router;
