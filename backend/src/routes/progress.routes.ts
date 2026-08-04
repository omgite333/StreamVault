import { Router } from 'express';
import * as progressController from '../controllers/progress.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateProgressSchema } from '../validations/progress.validation';

const router = Router();

router.get('/', authenticate, progressController.list);
router.put('/', authenticate, validate(updateProgressSchema), progressController.update);

export default router;
